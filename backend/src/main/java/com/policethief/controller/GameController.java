package com.policethief.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/game")
@CrossOrigin(origins = "*")
public class GameController {

    @PostMapping("/{roomId}/catch")
    public ResponseEntity<?> catchThief(
            @PathVariable Long roomId,
            @RequestBody CatchThiefRequest request) {
        // TODO: QR 코드 촬영으로 도둑 잡기 구현
        return ResponseEntity.ok().body("도둑 잡기 준비 중");
    }

    public static class CatchThiefRequest {
        private String qrCode;
        private Long thiefId;

        public String getQrCode() {
            return qrCode;
        }

        public void setQrCode(String qrCode) {
            this.qrCode = qrCode;
        }

        public Long getThiefId() {
            return thiefId;
        }

        public void setThiefId(Long thiefId) {
            this.thiefId = thiefId;
        }
    }
}
