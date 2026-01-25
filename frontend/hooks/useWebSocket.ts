import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { GameEventMessage } from '@/types/game';

interface UseWebSocketOptions {
  roomId: number;
  onMessage?: (message: GameEventMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

export const useWebSocket = ({
  roomId,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) => {
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 웹소켓 연결
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/ws';
    
    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('WebSocket 연결 성공');
        setIsConnected(true);
        setError(null);
        
        // 게임방 이벤트 구독
        client.subscribe(`/topic/game/${roomId}`, (message) => {
          try {
            const gameEvent: GameEventMessage = JSON.parse(message.body);
            console.log('게임 이벤트 수신:', gameEvent);
            onMessage?.(gameEvent);
          } catch (err) {
            console.error('메시지 파싱 오류:', err);
          }
        });
        
        onConnect?.();
      },
      
      onDisconnect: () => {
        console.log('WebSocket 연결 해제');
        setIsConnected(false);
        onDisconnect?.();
      },
      
      onStompError: (frame) => {
        console.error('STOMP 오류:', frame);
        const err = new Error(frame.headers['message'] || 'STOMP 오류 발생');
        setError(err);
        onError?.(err);
      },
      
      onWebSocketError: (event) => {
        console.error('WebSocket 오류:', event);
        const err = new Error('WebSocket 연결 오류');
        setError(err);
        onError?.(err);
      },
    });

    clientRef.current = client;
    client.activate();

    // 정리 함수
    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, [roomId, onMessage, onConnect, onDisconnect, onError]);

  // 메시지 전송 함수
  const sendMessage = useCallback((destination: string, body: any) => {
    if (clientRef.current?.connected) {
      clientRef.current.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('WebSocket이 연결되지 않았습니다.');
    }
  }, []);

  // 방 입장
  const joinRoom = useCallback((playerId: number, nickname: string) => {
    sendMessage(`/app/game/${roomId}/join`, {
      playerId,
      nickname,
    });
  }, [roomId, sendMessage]);

  // 방 퇴장
  const leaveRoom = useCallback((playerId: number) => {
    sendMessage(`/app/game/${roomId}/leave`, {
      playerId,
    });
  }, [roomId, sendMessage]);

  // 게임 시작
  const startGame = useCallback((hostId: number) => {
    sendMessage(`/app/game/${roomId}/start`, {
      hostId,
    });
  }, [roomId, sendMessage]);

  // 위치 업데이트
  const updateLocation = useCallback((
    playerId: number,
    latitude: number,
    longitude: number,
    accuracy?: number
  ) => {
    sendMessage(`/app/game/${roomId}/location`, {
      playerId,
      latitude,
      longitude,
      accuracy,
    });
  }, [roomId, sendMessage]);

  return {
    isConnected,
    error,
    sendMessage,
    joinRoom,
    leaveRoom,
    startGame,
    updateLocation,
  };
};

