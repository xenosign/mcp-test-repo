package com.policethief.service;

import com.policethief.dto.KakaoLoginResponse;
import com.policethief.dto.KakaoUserInfo;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
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
    private static final String KAKAO_USER_INFO_PATH = "/v2/user/me";
    
    private final WebClient webClient;
    
    public KakaoAuthService(
            @Value("${kakao.api.timeout:5000}") int timeout) {
        this.webClient = WebClient.builder()
                .baseUrl(KAKAO_API_BASE_URL)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
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
                    .onStatus(HttpStatus::is4xxClientError, response -> {
                        log.error("카카오 API 4xx 에러: {}", response.statusCode());
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED, "유효하지 않은 카카오 액세스 토큰입니다."));
                    })
                    .onStatus(HttpStatus::is5xxServerError, response -> {
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
