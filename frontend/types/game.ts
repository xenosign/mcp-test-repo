// 게임방 관련 타입 정의
export interface GameRoom {
  id: number;
  name: string;
  location: string;
  playerCount: number;
}

// 웹소켓 이벤트 타입
export enum GameEventType {
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  START = 'START',
  TAG = 'TAG',
  LOCATION = 'LOCATION',
}

// 웹소켓 메시지 타입
export interface GameEventMessage {
  type: GameEventType;
  roomId: number;
  playerId: number;
  data: Record<string, any>;
  timestamp?: string;
}

// 방 입장 요청
export interface JoinRoomRequest {
  playerId: number;
  nickname: string;
}

// 방 퇴장 요청
export interface LeaveRoomRequest {
  playerId: number;
}

// 위치 업데이트 요청
export interface LocationUpdateRequest {
  playerId: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// 게임 시작 요청
export interface StartGameRequest {
  hostId: number;
}

// 플레이어 정보
export interface Player {
  id: number;
  nickname: string;
  latitude?: number;
  longitude?: number;
}

