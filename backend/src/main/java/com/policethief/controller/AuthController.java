package com.policethief.controller;

import com.policethief.dto.KakaoLoginResponse;
import com.policethief.service.KakaoAuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final KakaoAuthService kakaoAuthService;

    @PostMapping("/kakao/login")
    public ResponseEntity<KakaoLoginResponse> kakaoLogin(@Valid @RequestBody KakaoLoginRequest request) {
        log.info("카카오 로그인 요청 수신");
        
        KakaoLoginResponse response = kakaoAuthService.getUserInfo(request.getAccessToken());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/kakao/oauth")
    public ResponseEntity<KakaoLoginResponse> kakaoOAuth(@Valid @RequestBody KakaoOAuthRequest request) {
        log.info("카카오 OAuth 인가 코드 요청 수신");

        KakaoLoginResponse response = kakaoAuthService.loginWithAuthorizationCode(
                request.getCode(), request.getRedirectUri());

        return ResponseEntity.ok(response);
    }

    public static class KakaoLoginRequest {
        @jakarta.validation.constraints.NotBlank(message = "액세스 토큰은 필수입니다.")
        private String accessToken;

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }
    }

    public static class KakaoOAuthRequest {
        @jakarta.validation.constraints.NotBlank(message = "인가 코드는 필수입니다.")
        private String code;

        @jakarta.validation.constraints.NotBlank(message = "redirectUri는 필수입니다.")
        private String redirectUri;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getRedirectUri() {
            return redirectUri;
        }

        public void setRedirectUri(String redirectUri) {
            this.redirectUri = redirectUri;
        }
    }
}
