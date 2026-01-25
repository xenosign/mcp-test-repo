# Running Man 게임 웹 앱

Running Man 게임을 도와주는 모바일 웹 애플리케이션입니다.

## 프로젝트 구조

이 프로젝트는 모노레포 구조로 구성되어 있습니다:

```
running-man-game/
├── frontend/          # Next.js 프론트엔드
├── backend/           # Spring Boot 백엔드
├── package.json       # 루트 워크스페이스 설정
└── README.md
```

## 기술 스택

### 프론트엔드

- **Next.js 14** (App Router)
- **TypeScript**
- **React 18**
- **STOMP.js** - WebSocket 통신
- **SockJS** - WebSocket 폴백 지원

### 백엔드

- **Spring Boot 3.2.0**
- **Java 17**
- **Spring Data JPA**
- **Spring WebSocket** - 실시간 게임 이벤트
- **H2 Database** (개발용)

## 주요 기능

1. **카카오톡 로그인** - 카카오톡 계정으로 로그인
2. **게임방 목록** - 실시간 게임방 목록 조회 및 참여
3. **WebSocket 실시간 통신** - 게임방 입장, 퇴장, 위치 업데이트 실시간 처리
4. **위치 기반 서비스** - 사용자 위치 추적 및 공유
5. **게임 시작** - 운영자가 게임을 시작할 수 있음
6. **QR 코드 촬영** - 플레이어가 다른 플레이어의 QR 코드를 촬영하여 태그하기

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- Java 17 이상
- Maven 3.6 이상

### 환경 변수 설정

**프론트엔드 (`frontend/.env.local`):**
```bash
# API 서버 URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# WebSocket 서버 URL
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws

# Kakao API Keys
NEXT_PUBLIC_KAKAO_REST_API_KEY=your_kakao_rest_api_key
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your_kakao_javascript_key
```

**백엔드 환경변수:**
- `KAKAO_REST_API_KEY` - 카카오 REST API 키

**카카오 OAuth 설정:**
- 리다이렉트 URI 등록: `http://localhost:3000/auth/kakao/callback`

### 설치 및 실행

1. **의존성 설치**

   ```bash
   npm run install:all
   ```

2. **프론트엔드 실행** (개발 모드)

   ```bash
   npm run dev:frontend
   ```

   프론트엔드는 `http://localhost:3000`에서 실행됩니다.

3. **백엔드 실행**
   ```bash
   npm run start:backend
   ```
   백엔드는 `http://localhost:8080/api`에서 실행됩니다.

### 개별 실행

**프론트엔드만 실행:**

```bash
cd frontend
npm install
npm run dev
```

**백엔드만 실행:**

```bash
cd backend
./mvnw spring-boot:run
```

## 개발 상태

### 완료된 기능
- [x] 게임방 목록 조회 UI
- [x] 게임방 입장/퇴장 기능
- [x] WebSocket 실시간 통신
- [x] 위치 정보 추적 및 공유
- [x] 참여자 목록 실시간 업데이트

### 구현 예정
- [ ] 카카오톡 로그인 완전 연동
- [ ] 백엔드 게임방 목록 API 구현
- [ ] 게임 시작 로직
- [ ] QR 코드 생성 및 인식
- [ ] 플레이어 태그 처리 로직
- [ ] 게임 점수 시스템

## API 엔드포인트

### REST API

#### 인증
- `POST /api/auth/kakao/login` - 카카오톡 로그인
- `POST /api/auth/kakao/oauth` - 카카오 OAuth 인가 코드 로그인

#### 게임방
- `GET /rooms` - 지역별 게임방 목록 조회
- `GET /rooms/{roomId}` - 게임방 상세 정보
- `POST /rooms/{roomId}/start` - 게임 시작

### WebSocket API

**연결:** `ws://localhost:8080/ws` (SockJS 사용)

#### 구독 (Subscribe)
- `/topic/game/{roomId}` - 게임방 이벤트 수신

#### 메시지 발행 (Send)
- `/app/game/{roomId}/join` - 게임방 입장
  ```json
  {
    "playerId": 123,
    "nickname": "플레이어1"
  }
  ```
- `/app/game/{roomId}/leave` - 게임방 퇴장
  ```json
  {
    "playerId": 123
  }
  ```
- `/app/game/{roomId}/start` - 게임 시작
  ```json
  {
    "hostId": 123
  }
  ```
- `/app/game/{roomId}/location` - 위치 업데이트
  ```json
  {
    "playerId": 123,
    "latitude": 37.5665,
    "longitude": 126.9780,
    "accuracy": 10
  }
  ```
- `/app/game/{roomId}/tag` - 플레이어 태그
  ```json
  {
    "taggerId": 123,
    "targetId": 456,
    "qrCode": "QR_CODE_DATA"
  }
  ```

## 라이선스

MIT
