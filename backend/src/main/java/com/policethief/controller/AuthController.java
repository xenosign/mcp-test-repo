package com.policethief.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/kakao/login")
    public ResponseEntity<?> kakaoLogin(@RequestBody KakaoLoginRequest request) {
        // TODO: 카카오톡 로그인 구현
        return ResponseEntity.ok().body("카카오톡 로그인 준비 중");
    }

    public static class KakaoLoginRequest {
        private String accessToken;

        public String getAccessToken() {
            return accessToken;
        }

        public void setAccessToken(String accessToken) {
            this.accessToken = accessToken;
        }
    }
}
