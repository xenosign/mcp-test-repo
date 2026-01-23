package com.policethief.service;

import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameRoomSessionService {
    private final ConcurrentHashMap<Long, Set<Long>> roomPlayers = new ConcurrentHashMap<>();

    public int joinRoom(Long roomId, Long playerId) {
        Set<Long> players = roomPlayers.computeIfAbsent(roomId, id -> ConcurrentHashMap.newKeySet());
        players.add(playerId);
        return players.size();
    }

    public int leaveRoom(Long roomId, Long playerId) {
        Set<Long> players = roomPlayers.getOrDefault(roomId, Collections.emptySet());
        players.remove(playerId);
        if (players.isEmpty()) {
            roomPlayers.remove(roomId);
        }
        return players.size();
    }

    public int getRoomSize(Long roomId) {
        return roomPlayers.getOrDefault(roomId, Collections.emptySet()).size();
    }
}
