package com.policethief.service;

import com.policethief.dto.KakaoLoginResponse;
import com.policethief.dto.KakaoTokenResponse;
import com.policethief.dto.KakaoUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

/**
 * 카카오 인증 서비스
 * 카카오 API를 호출하여 사용자 정보를 조회합니다.
 */
@Slf4j
@Service
public class KakaoAuthService {
    
    private static final String KAKAO_API_BASE_URL = "https://kapi.kakao.com";
    private static final String KAKAO_AUTH_BASE_URL = "https://kauth.kakao.com";
    private static final String KAKAO_USER_INFO_PATH = "/v2/user/me";
    private static final String KAKAO_TOKEN_PATH = "/oauth/token";
    
    private final WebClient webClient;
    private final WebClient authClient;
    private final String kakaoRestApiKey;
    
    public KakaoAuthService(
            @Value("${kakao.api.timeout:5000}") int timeout,
            @Value("${kakao.api.rest-key:}") String kakaoRestApiKey) {
        this.webClient = WebClient.builder()
                .baseUrl(KAKAO_API_BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
        this.authClient = WebClient.builder()
                .baseUrl(KAKAO_AUTH_BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
                .build();
        this.kakaoRestApiKey = kakaoRestApiKey;
    }

    /**
     * 인가 코드로 로그인 처리 (토큰 교환 + 사용자 정보 조회)
     */
    public KakaoLoginResponse loginWithAuthorizationCode(String code, String redirectUri) {
        String accessToken = getAccessToken(code, redirectUri);
        return getUserInfo(accessToken);
    }
    
    /**
     * 카카오 액세스 토큰으로 사용자 정보를 조회합니다.
     * 
     * @param accessToken 카카오 액세스 토큰
     * @return 카카오 사용자 정보
     * @throws ResponseStatusException 카카오 API 호출 실패 시
     */
    public KakaoLoginResponse getUserInfo(String accessToken) {
        if (accessToken == null || accessToken.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "카카오 액세스 토큰이 필요합니다.");
        }
        
        try {
            log.debug("카카오 사용자 정보 조회 시작 - 토큰: {}", accessToken.substring(0, Math.min(10, accessToken.length())) + "...");
            
            KakaoUserInfo kakaoUserInfo = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(KAKAO_USER_INFO_PATH)
                            .queryParam("property_keys", "[\"kakao_account.profile\", \"kakao_account.email\"]")
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), response -> {
                        log.error("카카오 API 4xx 에러: {}", response.statusCode());
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED, "유효하지 않은 카카오 액세스 토큰입니다."));
                    })
                    .onStatus(status -> status.is5xxServerError(), response -> {
                        log.error("카카오 API 5xx 에러: {}", response.statusCode());
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.SERVICE_UNAVAILABLE, "카카오 서버 오류가 발생했습니다."));
                    })
                    .bodyToMono(KakaoUserInfo.class)
                    .block();
            
            if (kakaoUserInfo == null) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "카카오 사용자 정보를 가져올 수 없습니다.");
            }
            
            log.debug("카카오 사용자 정보 조회 성공 - ID: {}", kakaoUserInfo.getId());
            
            return convertToLoginResponse(kakaoUserInfo);
            
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("카카오 사용자 정보 조회 중 오류 발생", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "카카오 로그인 처리 중 오류가 발생했습니다.", e);
        }
    }

    /**
     * 인가 코드로 카카오 액세스 토큰을 발급받습니다.
     */
    private String getAccessToken(String code, String redirectUri) {
        if (code == null || code.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "카카오 인가 코드가 필요합니다.");
        }
        if (redirectUri == null || redirectUri.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "redirectUri가 필요합니다.");
        }
        if (kakaoRestApiKey == null || kakaoRestApiKey.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "카카오 REST API 키가 설정되지 않았습니다.");
        }

        try {
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", "authorization_code");
            formData.add("client_id", kakaoRestApiKey);
            formData.add("redirect_uri", redirectUri);
            formData.add("code", code);

            KakaoTokenResponse tokenResponse = authClient.post()
                    .uri(KAKAO_TOKEN_PATH)
                    .bodyValue(formData)
                    .retrieve()
                    .onStatus(status -> status.is4xxClientError(), response -> {
                        log.error("카카오 토큰 4xx 에러: {}", response.statusCode());
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED, "유효하지 않은 인가 코드입니다."));
                    })
                    .onStatus(status -> status.is5xxServerError(), response -> {
                        log.error("카카오 토큰 5xx 에러: {}", response.statusCode());
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.SERVICE_UNAVAILABLE, "카카오 서버 오류가 발생했습니다."));
                    })
                    .bodyToMono(KakaoTokenResponse.class)
                    .block();

            if (tokenResponse == null || tokenResponse.getAccessToken() == null) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR, "카카오 액세스 토큰을 가져올 수 없습니다.");
            }

            return tokenResponse.getAccessToken();
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("카카오 토큰 발급 중 오류 발생", e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR, "카카오 토큰 발급 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * KakaoUserInfo를 KakaoLoginResponse로 변환합니다.
     */
    private KakaoLoginResponse convertToLoginResponse(KakaoUserInfo kakaoUserInfo) {
        String nickname = null;
        String profileImageUrl = null;
        String thumbnailImageUrl = null;
        String email = null;
        
        if (kakaoUserInfo.getKakaoAccount() != null) {
            KakaoUserInfo.KakaoAccount account = kakaoUserInfo.getKakaoAccount();
            
            if (account.getProfile() != null) {
                nickname = account.getProfile().getNickname();
                profileImageUrl = account.getProfile().getProfileImageUrl();
                thumbnailImageUrl = account.getProfile().getThumbnailImageUrl();
            }
            
            email = account.getEmail();
        }
        
        return KakaoLoginResponse.builder()
                .id(kakaoUserInfo.getId())
                .nickname(nickname)
                .email(email)
                .profileImageUrl(profileImageUrl)
                .thumbnailImageUrl(thumbnailImageUrl)
                .build();
    }
}
