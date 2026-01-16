package com.policethief.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
@CrossOrigin(origins = "*")
public class GameRoomController {

    @GetMapping
    public ResponseEntity<List<GameRoomResponse>> getRooms(
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        // TODO: 지역별 채팅방 목록 조회 구현
        return ResponseEntity.ok().body(List.of());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<GameRoomResponse> getRoom(@PathVariable Long roomId) {
        // TODO: 채팅방 상세 정보 조회 구현
        return ResponseEntity.ok().body(new GameRoomResponse());
    }

    @PostMapping("/{roomId}/start")
    public ResponseEntity<?> startGame(@PathVariable Long roomId) {
        // TODO: 게임 시작 구현
        return ResponseEntity.ok().body("게임 시작 준비 중");
    }

    public static class GameRoomResponse {
        private Long id;
        private String name;
        private String location;
        private Integer playerCount;

        // Getters and Setters
        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public Integer getPlayerCount() {
            return playerCount;
        }

        public void setPlayerCount(Integer playerCount) {
            this.playerCount = playerCount;
        }
    }
}
