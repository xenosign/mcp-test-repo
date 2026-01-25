'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameRoom } from '@/types/game';
import { getGameRooms } from '@/lib/gameApi';
import { useGeolocation } from '@/hooks/useGeolocation';

export default function GameRoomsPage() {
  const router = useRouter();
  const { location, error: geoError } = useGeolocation();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 게임방 목록 조회
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 위치 정보가 있으면 함께 전달
        const roomList = await getGameRooms(
          location?.latitude,
          location?.longitude
        );
        setRooms(roomList);
      } catch (err) {
        console.error('게임방 목록 조회 오류:', err);
        setError('게임방 목록을 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [location]);

  // 게임방 입장
  const handleJoinRoom = (roomId: number) => {
    router.push(`/rooms/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            게임방 목록
          </h1>
          <p className="text-gray-600">
            참여하고 싶은 게임방을 선택하세요
          </p>
        </div>

        {/* 위치 정보 상태 */}
        {geoError && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ 위치 정보를 사용할 수 없습니다. 근처 게임방을 표시할 수 없습니다.
            </p>
          </div>
        )}

        {location && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              📍 현재 위치: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </p>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* 오류 상태 */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 게임방 목록 */}
        {!loading && !error && rooms.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 mb-4 text-5xl">🎮</div>
            <p className="text-gray-600 mb-6">
              현재 이용 가능한 게임방이 없습니다.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              새로고침
            </button>
          </div>
        )}

        {!loading && !error && rooms.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200"
                onClick={() => handleJoinRoom(room.id)}
              >
                {/* 방 정보 */}
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {room.name}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mb-1">
                    <span className="mr-2">📍</span>
                    <span>{room.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <span className="mr-2">👥</span>
                    <span>{room.playerCount}명 참여 중</span>
                  </div>
                </div>

                {/* 입장 버튼 */}
                <button
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoinRoom(room.id);
                  }}
                >
                  입장하기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

