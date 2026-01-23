package com.policethief.controller;

import com.policethief.dto.GameEventMessage;
import com.policethief.dto.GameEventType;
import com.policethief.dto.JoinRoomRequest;
import com.policethief.dto.LeaveRoomRequest;
import com.policethief.dto.LocationUpdateRequest;
import com.policethief.dto.StartGameRequest;
import com.policethief.dto.TagEventRequest;
import com.policethief.service.GameRoomSessionService;
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
    private final GameRoomSessionService roomSessionService;

    @SuppressWarnings("null")
    private void sendEvent(Long roomId, GameEventMessage message) {
        messagingTemplate.convertAndSend("/topic/game/" + roomId, (Object) message);
    }

    @MessageMapping("/game/{roomId}/join")
    public void joinRoom(@DestinationVariable Long roomId, JoinRoomRequest request) {
        log.info("방 입장 이벤트 - roomId={}, playerId={}", roomId, request.getPlayerId());
        int memberCount = roomSessionService.joinRoom(roomId, request.getPlayerId());
        GameEventMessage message = GameEventMessage.of(
                GameEventType.JOIN,
                roomId,
                request.getPlayerId(),
                Map.of(
                        "nickname", request.getNickname(),
                        "memberCount", memberCount
                )
        );
        sendEvent(roomId, message);
    }

    @MessageMapping("/game/{roomId}/leave")
    public void leaveRoom(@DestinationVariable Long roomId, LeaveRoomRequest request) {
        log.info("방 퇴장 이벤트 - roomId={}, playerId={}", roomId, request.getPlayerId());
        int memberCount = roomSessionService.leaveRoom(roomId, request.getPlayerId());
        GameEventMessage message = GameEventMessage.of(
                GameEventType.LEAVE,
                roomId,
                request.getPlayerId(),
                Map.of("memberCount", memberCount)
        );
        sendEvent(roomId, message);
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
        sendEvent(roomId, message);
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
        sendEvent(roomId, message);
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
        sendEvent(roomId, message);
    }
}
