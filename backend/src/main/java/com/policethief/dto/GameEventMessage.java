package com.policethief.dto;

import java.util.Map;

public class GameEventMessage {
    private GameEventType type;
    private Long roomId;
    private Long senderId;
    private Map<String, Object> payload;
    private long timestamp;

    public static GameEventMessage of(GameEventType type, Long roomId, Long senderId, Map<String, Object> payload) {
        GameEventMessage message = new GameEventMessage();
        message.setType(type);
        message.setRoomId(roomId);
        message.setSenderId(senderId);
        message.setPayload(payload);
        message.setTimestamp(System.currentTimeMillis());
        return message;
    }

    public GameEventType getType() {
        return type;
    }

    public void setType(GameEventType type) {
        this.type = type;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Map<String, Object> getPayload() {
        return payload;
    }

    public void setPayload(Map<String, Object> payload) {
        this.payload = payload;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }
}
