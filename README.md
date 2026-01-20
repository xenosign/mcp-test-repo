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

### 백엔드

- **Spring Boot 3.2.0**
- **Java 17**
- **Spring Data JPA**
- **H2 Database** (개발용)

## 주요 기능

1. **카카오톡 로그인** - 카카오톡 계정으로 로그인
2. **지역별 채팅방 목록** - 위치 기반으로 가까운 게임방 조회
3. **게임 시작** - 운영자가 게임을 시작할 수 있음
4. **QR 코드 촬영** - 플레이어가 다른 플레이어의 QR 코드를 촬영하여 태그하기

## 시작하기

### 사전 요구사항

- Node.js 18 이상
- Java 17 이상
- Maven 3.6 이상

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

현재 기본 뼈대만 구성되어 있으며, 다음 기능들은 추후 구현 예정입니다:

- [ ] 카카오톡 로그인 연동
- [ ] 위치 기반 채팅방 목록 조회
- [ ] 게임방 입장 및 채팅 기능
- [ ] 게임 시작 로직
- [ ] QR 코드 생성 및 인식
- [ ] 플레이어 태그 처리 로직

## API 엔드포인트

### 인증

- `POST /api/auth/kakao/login` - 카카오톡 로그인

### 게임방

- `GET /api/rooms` - 지역별 게임방 목록 조회
- `GET /api/rooms/{roomId}` - 게임방 상세 정보
- `POST /api/rooms/{roomId}/start` - 게임 시작

### 게임

- `POST /api/game/{roomId}/tag` - 플레이어 태그 (QR 코드)

## 라이선스

MIT
