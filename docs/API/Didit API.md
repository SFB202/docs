# Didit API (v2026-02-02)

Base path: `/api/v1` (기본 포트: `8080`)

## 인증 (Authentication)

이 서버는 Spring Security OAuth2(GitHub)를 사용하며, 세션 쿠키(`JSESSIONID`)로 인증합니다.

- `GET /api/v1/auth/login`: GitHub OAuth 인가로 리다이렉트합니다 (`/oauth2/authorization/github`).
    
- `POST /api/v1/auth/logout`: 세션을 무효화하고 `JSESSIONID` 쿠키를 삭제합니다 (`SecurityConfig`에 설정).
    
- `GET /api/v1/auth/me`: 인증된 사용자 정보를 반환합니다 (`UserResponse`).
    

기본적으로 모든 엔드포인트는 인증이 필요하며, 아래 경로만 예외로 인증 없이 접근 가능합니다:  
`/`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/login/**`, `/oauth2/**`, `/error`.

## 컨벤션 (Conventions)

- 요청/응답 바디: JSON (별도 표기 없는 경우)
    
- 타임스탬프: ISO-8601 `LocalDateTime` (예: `2026-01-26T14:30:00`)
    
- 페이지네이션: Spring `Pageable` 파라미터 (`page`, `size`, `sort`)
    
- 커서: 일부 엔드포인트는 이전 페이지의 마지막 아이템 id를 `lastId` 또는 `cursor`로 받습니다.
    

### Enums

- `MeetingMode`: `CHAT | VOICE`
    
- `MeetingStatus`: `SCHEDULED | RUNNING | ENDED`
    
- `IssueStatus`: `OPEN | CLOSED`
    
- `IssuePriority`: `HIGH | MEDIUM | LOW`
    
- `MessageType`: `TEXT | SYSTEM`
    

### 에러 응답 (Error response)

대부분의 엔드포인트는 에러 바디를 `ErrorResponse` 형태로 반환합니다:

```json
{
  "statusCode": "NOT_FOUND",
  "message": "..."
}
```

HTTP 상태 코드도 `statusCode`에 대응되는 값으로 설정됩니다.

## 스키마 (Schemas, response)

### ProjectResponse

```json
{
  "id": 1,
  "name": "my-project",
  "ownerId": 10,
  "repoId": 123456,
  "repoFullName": "org/repo",
  "thumbnailUrl": "https://...",
  "createdAt": "2026-01-26T14:30:00",
  "updatedAt": "2026-01-26T14:30:00"
}
```

### UserResponse

```json
{
  "id": 10,
  "githubId": 999999,
  "githubLogin": "octocat",
  "name": "Octo Cat",
  "avatarUrl": "https://...",
  "createdAt": "2026-01-26T14:30:00",
  "lastLoginAt": "2026-01-26T14:30:00"
}
```

### MeetingResponse

```json
{
  "id": 100,
  "project": { "id": 1, "name": "my-project", "ownerId": 10, "repoId": 123456, "repoFullName": "org/repo", "thumbnailUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "updatedAt": "2026-01-26T14:30:00" },
  "createdBy": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" },
  "sessionId": "uuid-string",
  "title": "Daily",
  "status": "SCHEDULED",
  "mode": "VOICE",
  "startedAt": "2026-01-26T14:30:00",
  "endedAt": "2026-01-26T15:00:00",
  "createdAt": "2026-01-26T14:30:00",
  "updatedAt": "2026-01-26T14:30:00"
}
```

### IssueResponse

```json
{
  "id": 500,
  "project": { "id": 1, "name": "my-project", "ownerId": 10, "repoId": 123456, "repoFullName": "org/repo", "thumbnailUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "updatedAt": "2026-01-26T14:30:00" },
  "githubIssueId": 123456789,
  "issueNo": 42,
  "title": "Fix bug",
  "body": "...",
  "status": "OPEN",
  "priority": "MEDIUM",
  "author": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" },
  "createdAt": "2026-01-26T14:30:00",
  "updatedAt": "2026-01-26T14:30:00",
  "closedAt": null,
  "assignees": []
}
```

### ProjectRecentResponse

```json
{
  "id": 1,
  "user": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" },
  "project": { "id": 1, "name": "my-project", "ownerId": 10, "repoId": 123456, "repoFullName": "org/repo", "thumbnailUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "updatedAt": "2026-01-26T14:30:00" },
  "lastViewedAt": "2026-01-26T14:30:00"
}
```

### ChatResponse

```json
{
  "id": 1000,
  "userId": 10,
  "messageType": "TEXT",
  "message": "Hello",
  "createdAt": "2026-01-26T14:30:00",
  "editedAt": null
}
```

## 엔드포인트 (Endpoints)

### Auth

#### `GET /api/v1/auth/login`

GitHub OAuth 로그인 플로우로 리다이렉트합니다.

응답:

- `302 Found` + `Location: /oauth2/authorization/github`
    

#### `POST /api/v1/auth/logout`

로그아웃합니다(세션 무효화; `JSESSIONID` 삭제).

응답:

- `302 Found`로 `/` 리다이렉트 (현재 설정)
    

#### `GET /api/v1/auth/me`

현재 인증된 사용자 정보를 반환합니다.

응답:

- `200 OK` -> `UserResponse`
    

### Projects

#### `GET /api/v1/projects`

인증된 사용자의 프로젝트 목록을 조회합니다.

응답:

- `200 OK` -> `ProjectResponse[]`
    

#### `POST /api/v1/projects`

프로젝트를 생성하고, 생성자를 `ADMIN`으로 등록합니다.

요청 바디:

```json
{
  "projectName": "my-project",
  "githubUrl": "https://github.com/org/repo"
}
```

비고:

- 검증: `projectName` 최대 64자, `githubUrl`은 유효한 URL이어야 함
    

응답:

- `200 OK` (바디 없음)
    

#### `GET /api/v1/projects/{projectId}`

프로젝트 상세를 조회합니다(또한 인증된 사용자 기준 최근 조회 기록을 갱신합니다).

응답:

- `200 OK` -> `ProjectResponse`
    

#### `GET /api/v1/projects/recents`

인증된 사용자의 최근 조회 프로젝트를 최대 4개까지 조회합니다.

응답:

- `200 OK` -> `ProjectRecentResponse[]`
    

#### `GET /api/v1/projects/{projectId}/participants`

프로젝트 참가자 목록을 조회합니다.

응답:

- `200 OK` -> `UserResponse[]`
    

### Invites

#### `POST /api/v1/projects/invites`

프로젝트 초대 코드를 생성합니다(관리자만 가능).

요청 바디:

```json
{
  "projectId": 1,
  "expireDate": "2026-01-26T14:30:00"
}
```

비고:

- `expireDate`는 선택값이며, 생략 시 서버가 매우 먼 미래로 설정합니다.
    

응답:

- `200 OK` -> 초대 코드(UUID)
    

```json
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

#### `GET /api/v1/projects/invites/{inviteCode}`

초대 코드로 프로젝트를 조회합니다.

응답:

- `200 OK` -> `ProjectResponse`
    
- `400 Bad Request`: `inviteCode`가 UUID 형식이 아닐 때
    

#### `POST /api/v1/projects/invites/{inviteCode}`

초대 코드로 프로젝트에 참여합니다.

응답:

- `200 OK` (바디 없음)
    
- `400 Bad Request`: `inviteCode`가 UUID 형식이 아닐 때
    

### Meetings (Channels)

#### `POST /api/v1/projects/{projectId}/add-channel`

프로젝트에 미팅(채널)을 생성합니다.

요청 바디:

```json
{
  "title": "Daily",
  "mode": "VOICE"
}
```

응답:

- `200 OK` -> 생성된 미팅 id
    

```json
123
```

#### `POST /api/v1/projects/{projectId}/book-channel`

프로젝트에 미팅(채널)을 예약합니다.

요청 바디:

```json
{
  "title": "Planning",
  "start": "2026-01-26T14:30:00",
  "end": "2026-01-26T15:30:00"
}
```

비고:

- 검증: `title` 최대 50자, `start`/`end`는 미래 시간이어야 함
    
- 서버는 `start`가 `end`보다 늦으면 요청을 거부합니다.
    
- 미팅은 `status = SCHEDULED`, `mode = VOICE`로 저장됩니다(현재 구현 기준).
    

응답:

- `200 OK` -> 생성된 미팅 id
    

```json
456
```

#### `GET /api/v1/projects/{projectId}/channels`

프로젝트 내 미팅(채널) 목록을 조회합니다.

쿼리 파라미터:

- `status` (선택): `SCHEDULED | RUNNING | ENDED`
    
- `cursor` (권장): 이전 페이지 마지막 아이템 id (첫 페이지는 `0`)
    
- `page`, `size`, `sort`: Spring `Pageable` 파라미터 (`size` 기본값: `20`)
    

응답:

- `200 OK` -> `MeetingResponse[]` (`id` 내림차순)
    

#### `GET /api/v1/projects/{projectId}/channels/date`

특정 시간 범위 내의 프로젝트 미팅 목록을 조회합니다.

쿼리 파라미터(필수):

- `start` (ISO-8601 `LocalDateTime`)
    
- `end` (ISO-8601 `LocalDateTime`)
    

응답:

- `200 OK` -> `MeetingResponse[]` (`id` 내림차순)
    

#### `GET /api/v1/channels/{channelId}`

미팅 상세를 조회합니다.

응답:

- `200 OK` -> `MeetingResponse`
    

#### `PATCH /api/v1/channels/{channelId}`

미팅 제목 및/또는 시간 범위를 수정합니다.

쿼리 파라미터(모두 선택):

- `title` (string)
    
- `start` (ISO-8601 `LocalDateTime`)
    
- `due` (ISO-8601 `LocalDateTime`)
    

응답:

- `200 OK` (바디 없음)
    

#### `DELETE /api/v1/channels/{channelId}`

미팅을 삭제합니다.

응답:

- `200 OK` (바디 없음)
    

#### `POST /api/v1/channels/{channelId}/webrtc`

VOICE 미팅에 참여합니다(미디어 커넥션 생성 + 사용자 join 처리).

응답:

- `200 OK` -> 커넥션 토큰(string)
    
- `409 Conflict`: 미팅 모드가 `VOICE`가 아닐 때
    

#### `DELETE /api/v1/channels/{channelId}/webrtc`

VOICE 미팅에서 나갑니다(미디어 커넥션 종료 + 사용자 leave 처리).

응답:

- `200 OK` (바디 없음)
    
- `409 Conflict`: 미팅 모드가 `VOICE`가 아닐 때
    

#### `GET /api/v1/channels/{channelId}/webrtc/users`

VOICE 미팅에 연결된 사용자 목록을 조회합니다.

응답:

- `200 OK` -> `UserResponse[]`
    
- `409 Conflict`: 미팅 모드가 `VOICE`가 아닐 때
    

### Chat Messages

#### `POST /api/v1/channels/{channelId}/chats`

채널에 채팅 메시지를 전송합니다.

요청 바디:

```json
{
  "content": "Hello"
}
```

응답:

- `200 OK` (바디 없음)
    

#### `GET /api/v1/channels/{channelId}/chats`

채널의 채팅 메시지 목록을 조회합니다.

쿼리 파라미터:

- `lastId` (선택): 이전 페이지 마지막 채팅 id
    
- `page`, `size`, `sort`: Spring `Pageable` 파라미터 (`size` 기본값: `20`)
    

응답:

- `200 OK` -> `ChatResponse[]` (`id` 오름차순)
    

#### `PATCH /api/v1/channels/chats/{chatId}`

채팅 메시지를 수정합니다(작성자만 가능).

요청 바디:

```json
{
  "content": "Edited message"
}
```

응답:

- `200 OK` (바디 없음)
    

#### `DELETE /api/v1/channels/chats/{chatId}`

채팅 메시지를 삭제합니다(작성자만 가능).

응답:

- `200 OK` (바디 없음)
    

### SSE (Server-Sent Events)

#### `GET /api/v1/channels/{channelId}/stream`

채널의 실시간 채팅 이벤트를 구독합니다. 사용자는 해당 채널의 프로젝트 멤버여야 합니다.

응답:

- `200 OK` + `Content-Type: text/event-stream`
    
- `403 Forbidden`: 사용자가 멤버가 아닐 때
    

Emitter 동작:

- 타임아웃: 30분 (클라이언트는 재연결 필요)
    
- Keep-alive: 20초마다 `ping` 이벤트
    

이벤트 종류:

- `message`: 새 채팅 메시지 생성 시
    
- `chat_update`: 채팅 메시지 수정 시
    
- `chat_delete`: 채팅 메시지 삭제 시
    
- `ping`: keep-alive 이벤트(빈 문자열 데이터)
    

이벤트 페이로드:

`message` data:

```json
{
  "channelId": 1,
  "senderId": 10,
  "content": "Hello",
  "sentAtEpochMs": 1738209000000
}
```

`chat_update` data:

```json
{
  "chatId": 1000,
  "content": "Edited message",
  "editedAt": "2026-01-26T14:30:00"
}
```

`chat_delete` data:

```json
{
  "chatId": 1000,
  "content": "Original message"
}
```

비고:

- `message` 이벤트는 채널 id(미팅 id 또는 프로젝트 id) 기준으로 브로드캐스트됩니다.
    
- `chat_update`, `chat_delete` 이벤트는 현재 `projectId` 기준으로 브로드캐스트됩니다.  
    미팅 메시지 업데이트가 필요한 클라이언트는 부모 프로젝트 채널도 함께 구독해야 합니다.
    

### Issues

#### `GET /api/v1/projects/{projectId}/issues/active`

프로젝트의 활성(OPEN) 이슈를 최대 5개까지 조회하며, `updatedAt` 내림차순으로 정렬합니다.

응답:

- `200 OK` -> `IssueResponse[]`