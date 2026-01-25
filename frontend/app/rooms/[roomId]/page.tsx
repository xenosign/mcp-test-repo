'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';
import { GameRoom, GameEventMessage, GameEventType, Player } from '@/types/game';
import { getGameRoom } from '@/lib/gameApi';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = Number(params.roomId);
  
  const { location } = useGeolocation();
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 현재 사용자 정보 (임시 - 실제로는 인증에서 가져와야 함)
  const [currentUser] = useState({
    id: Math.floor(Math.random() * 10000),
    nickname: `플레이어${Math.floor(Math.random() * 1000)}`,
  });

  // 게임 이벤트 처리
  const handleGameEvent = useCallback((message: GameEventMessage) => {
    console.log('게임 이벤트:', message);
    
    switch (message.type) {
      case GameEventType.JOIN:
        // 플레이어 입장
        const joinedPlayer: Player = {
          id: message.playerId,
          nickname: message.data.nickname as string,
        };
        setPlayers((prev) => {
          const exists = prev.find((p) => p.id === joinedPlayer.id);
          return exists ? prev : [...prev, joinedPlayer];
        });
        
        // 방 인원수 업데이트
        if (room) {
          setRoom({
            ...room,
            playerCount: message.data.memberCount as number,
          });
        }
        break;
        
      case GameEventType.LEAVE:
        // 플레이어 퇴장
        setPlayers((prev) => prev.filter((p) => p.id !== message.playerId));
        
        // 방 인원수 업데이트
        if (room) {
          setRoom({
            ...room,
            playerCount: message.data.memberCount as number,
          });
        }
        break;
        
      case GameEventType.START:
        // 게임 시작
        alert('게임이 시작되었습니다!');
        break;
        
      case GameEventType.LOCATION:
        // 위치 업데이트
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === message.playerId
              ? {
                  ...p,
                  latitude: message.data.latitude as number,
                  longitude: message.data.longitude as number,
                }
              : p
          )
        );
        break;
        
      default:
        console.log('알 수 없는 이벤트 타입:', message.type);
    }
  }, [room]);

  // 웹소켓 연결
  const {
    isConnected,
    error: wsError,
    joinRoom: wsJoinRoom,
    leaveRoom: wsLeaveRoom,
    updateLocation,
  } = useWebSocket({
    roomId,
    onMessage: handleGameEvent,
    onConnect: () => {
      console.log('웹소켓 연결됨');
    },
    onDisconnect: () => {
      console.log('웹소켓 연결 해제됨');
    },
    onError: (err) => {
      console.error('웹소켓 오류:', err);
      setError('웹소켓 연결 오류가 발생했습니다.');
    },
  });

  // 게임방 정보 조회
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const roomData = await getGameRoom(roomId);
        setRoom(roomData);
      } catch (err) {
        console.error('게임방 조회 오류:', err);
        setError('게임방 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  // 방 입장
  const handleJoinRoom = () => {
    if (isConnected && !joined) {
      wsJoinRoom(currentUser.id, currentUser.nickname);
      setJoined(true);
    }
  };

  // 방 퇴장
  const handleLeaveRoom = () => {
    if (isConnected && joined) {
      wsLeaveRoom(currentUser.id);
      setJoined(false);
      router.push('/rooms');
    }
  };

  // 위치 업데이트 (5초마다)
  useEffect(() => {
    if (!joined || !location || !isConnected) return;

    const interval = setInterval(() => {
      updateLocation(
        currentUser.id,
        location.latitude,
        location.longitude,
        location.accuracy
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [joined, location, isConnected, currentUser.id, updateLocation]);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 오류 상태
  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || '게임방을 찾을 수 없습니다.'}</div>
          <button
            onClick={() => router.push('/rooms')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/rooms')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← 목록으로 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {room.name}
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span className="flex items-center">
              📍 {room.location}
            </span>
            <span className="flex items-center">
              👥 {room.playerCount}명
            </span>
          </div>
        </div>

        {/* 연결 상태 */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium">
                {isConnected ? '연결됨' : '연결 끊김'}
              </span>
            </div>
            {wsError && (
              <span className="text-sm text-red-600">{wsError.message}</span>
            )}
          </div>
        </div>

        {/* 입장/퇴장 버튼 */}
        <div className="mb-6">
          {!joined ? (
            <button
              onClick={handleJoinRoom}
              disabled={!isConnected}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isConnected ? '방 입장하기' : '연결 중...'}
            </button>
          ) : (
            <button
              onClick={handleLeaveRoom}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              방 나가기
            </button>
          )}
        </div>

        {/* 현재 사용자 정보 */}
        {joined && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">내 정보</h3>
            <p className="text-sm text-blue-800">
              닉네임: {currentUser.nickname} (ID: {currentUser.id})
            </p>
            {location && (
              <p className="text-sm text-blue-800 mt-1">
                위치: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}

        {/* 참여자 목록 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            참여자 목록 ({players.length}명)
          </h2>
          
          {players.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              아직 참여자가 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className={`p-4 rounded-lg border ${
                    player.id === currentUser.id
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {player.nickname}
                        {player.id === currentUser.id && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">
                            나
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">ID: {player.id}</p>
                    </div>
                    {player.latitude && player.longitude && (
                      <div className="text-sm text-gray-600">
                        📍 위치 공유 중
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

