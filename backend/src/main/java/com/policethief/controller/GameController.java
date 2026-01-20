package com.policethief.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/game")
@CrossOrigin(origins = "*")
public class GameController {

    @PostMapping("/{roomId}/tag")
    public ResponseEntity<?> tagPlayer(
            @PathVariable Long roomId,
            @RequestBody TagPlayerRequest request) {
        // TODO: QR 코드 촬영으로 플레이어 태그 구현
        return ResponseEntity.ok().body("플레이어 태그 준비 중");
    }

    public static class TagPlayerRequest {
        private String qrCode;
        private Long playerId;

        public String getQrCode() {
            return qrCode;
        }

        public void setQrCode(String qrCode) {
            this.qrCode = qrCode;
        }

        public Long getPlayerId() {
            return playerId;
        }

        public void setPlayerId(Long playerId) {
            this.playerId = playerId;
        }
    }
}
