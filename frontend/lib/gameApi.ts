import axios from 'axios';
import { GameRoom } from '@/types/game';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 게임방 목록 조회
export const getGameRooms = async (
  latitude?: number,
  longitude?: number
): Promise<GameRoom[]> => {
  try {
    const params = new URLSearchParams();
    if (latitude !== undefined) params.append('latitude', latitude.toString());
    if (longitude !== undefined) params.append('longitude', longitude.toString());
    
    const response = await axios.get<GameRoom[]>(
      `${apiBaseUrl}/rooms${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  } catch (error) {
    console.error('게임방 목록 조회 실패:', error);
    throw error;
  }
};

// 게임방 상세 조회
export const getGameRoom = async (roomId: number): Promise<GameRoom> => {
  try {
    const response = await axios.get<GameRoom>(`${apiBaseUrl}/rooms/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('게임방 상세 조회 실패:', error);
    throw error;
  }
};

// 게임 시작
export const startGameRoom = async (roomId: number): Promise<void> => {
  try {
    await axios.post(`${apiBaseUrl}/rooms/${roomId}/start`);
  } catch (error) {
    console.error('게임 시작 실패:', error);
    throw error;
  }
};

