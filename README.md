# MCP 설정 가이드

## Cursor에서 MCP 설정하기

### 방법 1: Cursor 설정 UI 사용 (권장)

1. Cursor를 열고 `Ctrl + ,` (또는 `Cmd + ,` on Mac)로 설정 열기
2. 검색창에 "MCP" 또는 "Model Context Protocol" 입력
3. MCP 서버 설정 섹션에서 설정 추가

### 방법 2: 설정 파일 직접 편집

Cursor의 사용자 설정 디렉토리에 MCP 설정 파일을 생성합니다:

**Windows 경로:**
```
%APPDATA%\Cursor\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json
```

**설정 파일 내용:**
`mcp-config.json` 파일을 참고하세요. 이 파일의 내용을 위 경로의 설정 파일에 복사하여 사용하시면 됩니다.

### 프로젝트별 설정

프로젝트 루트에 `.cursorrules` 파일이 생성되어 있습니다. 이 파일은 Cursor AI의 동작을 제어하는 규칙을 정의합니다.

## 참고 파일

- `mcp-config.json`: MCP 서버 설정 예시
- `.cursorrules`: Cursor AI 코딩 규칙

