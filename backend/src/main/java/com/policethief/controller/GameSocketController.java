package com.policethief.controller;

import com.policethief.dto.GameEventMessage;
import com.policethief.dto.GameEventType;
import com.policethief.dto.JoinRoomRequest;
import com.policethief.dto.LocationUpdateRequest;
import com.policethief.dto.StartGameRequest;
import com.policethief.dto.TagEventRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Slf4j
@Controller
@RequiredArgsConstructor
public class GameSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game/{roomId}/join")
    public void joinRoom(@DestinationVariable Long roomId, JoinRoomRequest request) {
        log.info("방 입장 이벤트 - roomId={}, playerId={}", roomId, request.getPlayerId());
        GameEventMessage message = GameEventMessage.of(
                GameEventType.JOIN,
                roomId,
                request.getPlayerId(),
                Map.of("nickname", request.getNickname())
        );
        messagingTemplate.convertAndSend("/topic/game/" + roomId, message);
    }

    @MessageMapping("/game/{roomId}/start")
    public void startGame(@DestinationVariable Long roomId, StartGameRequest request) {
        log.info("게임 시작 이벤트 - roomId={}, hostId={}", roomId, request.getHostId());
        GameEventMessage message = GameEventMessage.of(
                GameEventType.START,
                roomId,
                request.getHostId(),
                Map.of("status", "started")
        );
        messagingTemplate.convertAndSend("/topic/game/" + roomId, message);
    }

    @MessageMapping("/game/{roomId}/tag")
    public void tagPlayer(@DestinationVariable Long roomId, TagEventRequest request) {
        log.info("태그 이벤트 - roomId={}, taggerId={}, targetId={}", roomId, request.getTaggerId(), request.getTargetId());
        GameEventMessage message = GameEventMessage.of(
                GameEventType.TAG,
                roomId,
                request.getTaggerId(),
                Map.of(
                        "targetId", request.getTargetId(),
                        "qrCode", request.getQrCode()
                )
        );
        messagingTemplate.convertAndSend("/topic/game/" + roomId, message);
    }

    @MessageMapping("/game/{roomId}/location")
    public void updateLocation(@DestinationVariable Long roomId, LocationUpdateRequest request) {
        GameEventMessage message = GameEventMessage.of(
                GameEventType.LOCATION,
                roomId,
                request.getPlayerId(),
                Map.of(
                        "latitude", request.getLatitude(),
                        "longitude", request.getLongitude(),
                        "accuracy", request.getAccuracy()
                )
        );
        messagingTemplate.convertAndSend("/topic/game/" + roomId, message);
    }
}
