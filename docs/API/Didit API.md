# Didit Server API (2026 - 02 - 05)

기본 Base path: `/api/v1` (기본 포트: `8080`)

## 인증(Authentication)

이 서버는 **Spring Security OAuth2(깃허브)** 를 사용하며, **세션 쿠키(`JSESSIONID`)** 기반 인증을 사용합니다.

- `GET /api/v1/auth/login`: GitHub OAuth 인가 페이지(`/oauth2/authorization/github`)로 리다이렉트합니다.
    
- `POST /api/v1/auth/logout`: 세션을 무효화하고 `JSESSIONID` 쿠키를 제거합니다.
    
- `GET /api/v1/auth/me`: 로그인된 사용자 정보를 반환합니다(`UserResponse`).
    

기본적으로 모든 엔드포인트는 인증이 필요합니다. 단, 아래 경로는 예외적으로 인증 없이 접근 가능합니다:

- `/`
    
- `/openapi.yaml`
    
- `/swagger-ui.html`
    
- `/swagger-ui/**`
    
- `/v3/api-docs/swagger-config`
    
- `/api/v1/auth/login`
    
- `/api/v1/auth/logout`
    
- `/login/**`
    
- `/oauth2/**`
    
- `/error`
    
- `/api/v1/webhooks/openvidu`
    

---

## 규칙(Conventions)

- 요청/응답 본문: JSON (별도 언급이 없으면)
    
- 타임스탬프: ISO-8601 `LocalDateTime` (예: `2026-01-26T14:30:00`)
    
- 페이지네이션: Spring `Pageable` 파라미터(`page`, `size`, `sort`)
    
- 커서 기반: 일부 엔드포인트는 이전 페이지의 마지막 아이템 id로 `lastId` 또는 `cursor`를 받습니다.
    

### Enum

- `MeetingMode`: `CHAT | VOICE`
    
- `MeetingStatus`: `SCHEDULED | RUNNING | ENDED`
    
- `IssueStatus`: `OPEN | CLOSED`
    
- `IssuePriority`: `HIGH | MEDIUM | LOW`
    
- `MessageType`: `TEXT | SYSTEM`
    

### 에러 응답(Error response)

대부분의 엔드포인트는 에러 발생 시 `ErrorResponse` 형태로 응답 본문을 반환합니다.

```json
{
  "StatusCode": "NOT_FOUND",
  "Message": "..."
}
```

HTTP 상태 코드도 위 `StatusCode`에 맞춰 설정됩니다.

---

## 스키마(응답)

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

### AiResponse

```json
{
  "issueId": 100,
  "title": "Fix bug",
  "body": "...",
  "status": "OPEN",
  "priority": "MEDIUM",
  "assigneeIds": [10, 11]
}
```

### GithubRepoResponse

```json
{
  "repoId": 123456,
  "repoName": "org/repo"
}
```

---

## 엔드포인트(Endpoints)

## Auth

### `GET /api/v1/auth/login`

GitHub OAuth 로그인 플로우로 리다이렉트합니다.

응답:

- `302 Found` + `Location: /oauth2/authorization/github`
    

### `POST /api/v1/auth/logout`

로그아웃합니다(세션 무효화 + `JSESSIONID` 제거).

응답:

- `200 OK` (빈 본문)
    

### `GET /api/v1/auth/me`

현재 인증된 사용자 정보를 반환합니다.

응답:

- `200 OK` -> `UserResponse`
    
- 로그인 상태가 아니면 `401 Unauthorized`
    

---

## Projects

### `GET /api/v1/projects`

현재 로그인한 사용자가 속한 프로젝트 목록을 반환합니다.

응답:

- `200 OK` -> `ProjectResponse[]`
    

### `POST /api/v1/projects`

프로젝트를 생성하고, 생성자를 `ADMIN`으로 등록합니다.

요청 본문:

```json
{
  "projectName": "my-project",
  "githubUrl": "https://github.com/org/repo"
}
```

참고:

- 검증: `projectName` 최대 64자, `githubUrl`은 올바른 URL이어야 함
    

응답:

- `200 OK` (빈 본문)
    

### `GET /api/v1/projects/{projectId}`

프로젝트 상세를 조회합니다. (동시에 해당 사용자의 최근 조회 목록도 업데이트합니다.)

응답:

- `200 OK` -> `ProjectResponse`
    

### `GET /api/v1/projects/recents`

현재 사용자의 최근 조회 프로젝트를 최대 4개까지 반환합니다.

응답:

- `200 OK` -> `ProjectRecentResponse[]`
    

### `GET /api/v1/projects/{projectId}/participants`

프로젝트 참여자 목록을 반환합니다.

응답:

- `200 OK` -> `UserResponse[]`
    

### `DELETE /api/v1/projects/{projectId}`

프로젝트를 삭제합니다(소유자만 가능).

응답:

- `200 OK` (빈 본문)
    

### `DELETE /api/v1/projects/{projectId}/leave`

프로젝트에서 탈퇴합니다.

응답:

- `200 OK` (빈 본문)
    

### `DELETE /api/v1/projects/{projectId}/participants/{userId}`

프로젝트 참여자를 제거합니다(소유자만 가능).

응답:

- `200 OK` (빈 본문)
    

### `POST /api/v1/projects/{projectId}/github/validate`

프로젝트의 GitHub 저장소 정보가 유효한지 검증합니다.

요청 본문:

```json
{
  "orgName": "org",
  "repoName": "repo"
}
```

응답:

- `200 OK` -> `GithubRepoResponse`
    

### `PATCH /api/v1/projects/{projectId}`

프로젝트의 저장소 정보를 갱신합니다.

요청 본문:

```json
{
  "repoId": 123456,
  "repoFullName": "org/repo"
}
```

응답:

- `200 OK` (빈 본문)
    

### `PATCH /api/v1/projects/{projectId}/owner`

프로젝트 소유권을 이전합니다.

요청 본문:

```json
{
  "newOwnerId": 99
}
```

응답:

- `200 OK` (빈 본문)
    

### `PATCH /api/v1/projects/{projectId}/name`

프로젝트 이름을 변경합니다.

요청 본문:

```json
{
  "name": "new-project-name"
}
```

참고:

- 검증: `name`은 필수이며 최대 100자
    

응답:

- `200 OK` (빈 본문)
    

---

## Invites

### `POST /api/v1/projects/invites`

프로젝트 초대 코드를 생성합니다(관리자만 가능).

요청 본문:

```json
{
  "projectId": 1,
  "expireDate": "2026-01-26T14:30:00"
}
```

참고:

- `expireDate`는 선택값이며, 생략하면 서버가 매우 먼 미래로 만료일을 설정합니다.
    

응답:

- `200 OK` -> 초대 코드(UUID)
    

```json
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

### `GET /api/v1/projects/invites/{inviteCode}`

초대 코드로 프로젝트 정보를 조회합니다.

응답:

- `200 OK` -> `ProjectResponse`
    
- `inviteCode`가 UUID 형식이 아니면 `400 Bad Request`
    

### `POST /api/v1/projects/invites/{inviteCode}`

초대 코드를 사용해 프로젝트에 참여합니다.

응답:

- `200 OK` (빈 본문)
    
- `inviteCode`가 UUID 형식이 아니면 `400 Bad Request`
    

---

## Meetings (Channels)

### `POST /api/v1/projects/{projectId}/add-channel`

프로젝트에 회의(채널)를 생성합니다(관리자만 가능). 생성 시 상태는 `RUNNING`입니다.

요청 본문:

```json
{
  "title": "Daily",
  "mode": "VOICE"
}
```

응답:

- `200 OK` -> 생성된 meeting id
    

```json
123
```

### `POST /api/v1/projects/{projectId}/book-channel`

프로젝트에 회의(채널)를 예약합니다(관리자만 가능). 생성 시 상태는 `SCHEDULED`, 모드는 `VOICE`입니다.

요청 본문:

```json
{
  "title": "Planning",
  "start": "2026-01-26T14:30:00",
  "end": "2026-01-26T15:30:00"
}
```

참고:

- 검증: `title` 최대 50자, `start`/`end`는 미래 시간이어야 함
    
- `start`가 `end`보다 늦으면 서버가 요청을 거부합니다.
    

응답:

- `200 OK` -> 생성된 meeting id
    

```json
456
```

### `GET /api/v1/projects/{projectId}/channels`

프로젝트의 회의(채널) 목록을 조회합니다.

쿼리 파라미터:

- `status`(선택): `SCHEDULED | RUNNING | ENDED`
    
- `cursor`(권장): 이전 페이지 마지막 항목 id (첫 페이지는 `0`)
    
- `page`, `size`, `sort`: Spring `Pageable` (`size` 기본 `20`)
    

응답:

- `200 OK` -> `MeetingResponse[]` (`id` 내림차순 정렬)
    

### `GET /api/v1/projects/{projectId}/channels/date`

프로젝트에서 특정 기간 내 회의(채널) 목록을 조회합니다.

쿼리 파라미터(필수):

- `start` (ISO-8601 `LocalDateTime`)
    
- `end` (ISO-8601 `LocalDateTime`)
    

응답:

- `200 OK` -> `MeetingResponse[]` (`id` 내림차순 정렬)
    

### `GET /api/v1/channels/{channelId}`

회의(채널) 상세를 조회합니다.

응답:

- `200 OK` -> `MeetingResponse`
    

### `PATCH /api/v1/channels/{channelId}`

회의 제목 및/또는 시간 범위를 수정합니다.

쿼리 파라미터(모두 선택):

- `title` (문자열)
    
- `start` (ISO-8601 `LocalDateTime`)
    
- `due` (ISO-8601 `LocalDateTime`, 종료 시간)
    

응답:

- `200 OK` (빈 본문)
    

### `DELETE /api/v1/channels/{channelId}`

회의(채널)를 삭제합니다.

응답:

- `200 OK` (빈 본문)
    

### `POST /api/v1/channels/{channelId}/webrtc`

VOICE 회의에 참여합니다(미디어 연결을 생성하고 사용자를 “참여 상태”로 기록).

응답:

- `200 OK` -> connection token (문자열)
    
- 회의 모드가 `VOICE`가 아니면 `409 Conflict`
    

### `DELETE /api/v1/channels/{channelId}/webrtc`

VOICE 회의에서 나갑니다(미디어 연결을 닫고 사용자를 “퇴장 상태”로 기록).

응답:

- `200 OK` (빈 본문)
    
- 회의 모드가 `VOICE`가 아니면 `409 Conflict`
    

### `GET /api/v1/channels/{channelId}/webrtc/users`

VOICE 회의에 연결된 사용자 목록을 조회합니다.

응답:

- `200 OK` -> `UserResponse[]`
    
- 회의 모드가 `VOICE`가 아니면 `409 Conflict`
    

### `POST /api/v1/channels/{channelId}/recording/start`

VOICE 회의 녹화를 시작합니다.

응답:

- `200 OK` -> recording id (long)
    

```json
789
```

### `POST /api/v1/channels/{channelId}/recording/stop/{recordId}`

VOICE 회의 녹화를 종료합니다.

응답:

- `200 OK` (빈 본문)
    

---

## Chat Messages

### `POST /api/v1/channels/{channelId}/chats`

채널에 채팅 메시지를 전송합니다.

요청 본문:

```json
{
  "content": "Hello"
}
```

응답:

- `200 OK` (빈 본문)
    

### `GET /api/v1/channels/{channelId}/chats`

채널의 채팅 메시지 목록을 조회합니다.

쿼리 파라미터:

- `lastId`(선택): 이전 페이지 마지막 채팅 id
    
- `page`, `size`, `sort`: Spring `Pageable` (`size` 기본 `20`)
    

응답:

- `200 OK` -> `ChatResponse[]` (`id` 오름차순 정렬)
    

### `PATCH /api/v1/channels/chats/{chatId}`

채팅 메시지를 수정합니다(작성자만 가능).

요청 본문:

```json
{
  "content": "Edited message"
}
```

응답:

- `200 OK` (빈 본문)
    

### `DELETE /api/v1/channels/chats/{chatId}`

채팅 메시지를 삭제합니다(작성자만 가능).

응답:

- `200 OK` (빈 본문)
    

---

## SSE (Server-Sent Events)

### `GET /api/v1/channels/{channelId}/stream`

채널의 실시간 이벤트를 구독합니다. 사용자는 채널이 속한 프로젝트의 멤버여야 합니다.

응답:

- `200 OK`, `Content-Type: text/event-stream`
    
- 프로젝트 멤버가 아니면 `403 Forbidden`
    

Emitter 동작:

- 타임아웃: 30분(클라이언트는 재연결 필요)
    
- Keep-alive: 20초마다 `ping` 이벤트 전송
    

이벤트:

- `message`: 새 채팅 메시지
    
- `chat_update`: 채팅 수정
    
- `chat_delete`: 채팅 삭제
    
- `media_participant_joined`
    
- `media_participant_left`
    
- `media_recording_start`
    
- `media_recording_stop`
    
- `media_error`
    
- `ping`
    

이벤트 페이로드 예시:

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

`media_participant_joined` data:

```json
{
  "channelId": 1,
  "timestamp": "2026-01-26T14:30:00",
  "sessionId": "session-id",
  "connectionId": "connection-id",
  "user": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" }
}
```

`media_participant_left` data:

```json
{
  "channelId": 1,
  "timestamp": "2026-01-26T14:30:00",
  "sessionId": "session-id",
  "connectionId": "connection-id",
  "user": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" }
}
```

`media_recording_start` data:

```json
{
  "channelId": 1,
  "timestamp": "2026-01-26T14:30:00",
  "sessionId": "session-id"
}
```

`media_recording_stop` data:

```json
{
  "channelId": 1,
  "timestamp": "2026-01-26T14:30:00",
  "sessionId": "session-id"
}
```

`media_error` data:

```json
{
  "channelId": 1,
  "errorResponse": { "StatusCode": "INTERNAL_SERVER_ERROR", "Message": "..." }
}
```

참고:

- 현재 `chat_update`와 `chat_delete`는 **채널 id 대신 `projectId`를 채널 id처럼 사용하여 브로드캐스트**되고 있습니다.  
    이 업데이트를 받아야 하는 클라이언트는 `/api/v1/channels/{projectId}/stream`도 함께 구독해야 합니다.
    

### `GET /api/v1/projects/{projectId}/stream`

프로젝트 단위 이벤트를 구독합니다. 사용자는 해당 프로젝트 멤버여야 합니다.

응답:

- `200 OK`, `Content-Type: text/event-stream`
    
- 프로젝트 멤버가 아니면 `403 Forbidden`
    

Emitter 동작:

- 타임아웃: 30분(클라이언트는 재연결 필요)
    
- Keep-alive: 20초마다 `ping` 이벤트 전송
    

이벤트:

- `ai_sort_result`: AI 정렬 결과(이슈 id 배열)
    
- `ping`
    

`ai_sort_result` data:

```json
[100, 101, 102]
```

참고:

- `GET /api/v1/projects/{projectId}/issues/active`는 정렬 작업을 큐에 넣고, 비동기 결과가 오면 `ai_sort_result` 이벤트를 트리거합니다.
    

---

## Issues

### `GET /api/v1/projects/{projectId}/issues/active`

프로젝트의 활성(OPEN) 이슈를 최대 5개 반환합니다. `updatedAt` 내림차순으로 정렬됩니다.

응답:

- `200 OK` -> `IssueResponse[]`
    

참고:

- 동시에 이 이슈들에 대해 AI 정렬 작업도 큐에 넣습니다.
    

### `GET /api/v1/projects/{projectId}/issues`

프로젝트의 모든 이슈를 조회합니다.

응답:

- `200 OK` -> `IssueResponse[]`
    

### `POST /api/v1/projects/{projectId}/issue/analyze`

이슈 우선순위를 분석합니다(드래프트 이슈를 만들고 AI 분석 작업을 큐에 넣음).

요청 본문:

```json
{
  "title": "Fix bug",
  "body": "Steps to reproduce...",
  "status": "OPEN",
  "assigneeIds": [10, 11]
}
```

응답:

- `200 OK` -> `AiResponse`
    

### `POST /api/v1/projects/{projectId}/issues`

(analyze로 만들어진) 드래프트 이슈를 기반으로 GitHub 이슈를 생성합니다.

요청 본문:

```json
{
  "orgName": "org",
  "repoName": "repo",
  "issueId": 100,
  "issueStatus": "OPEN",
  "issuePriority": "HIGH",
  "title": "Fix bug",
  "body": "Steps to reproduce...",
  "assigneeIds": [10, 11]
}
```

참고:

- `issueId`는 **동일 작성자가 analyze로 생성한 드래프트 이슈**여야 합니다.
    
- `issueStatus`는 입력은 받지만 현재 서버에서는 사용하지 않습니다.
    

응답:

- `200 OK` -> `IssueResponse[]` (0개 또는 1개)
    

### `PATCH /api/v1/projects/{projectId}/issues/{issueId}`

이슈를 수정합니다(작성자만 가능).

요청 본문:

```json
{
  "title": "Updated title",
  "body": "Updated body",
  "assigneeIds": [10]
}
```

응답:

- `200 OK` (빈 본문)
    

### `DELETE /api/v1/projects/{projectId}/issues/{issueId}`

이슈를 삭제합니다(작성자만 가능).

응답:

- `200 OK` (빈 본문)
    

---

## Webhooks

### `POST /api/v1/webhooks/openvidu`

OpenVidu 서버의 웹훅을 수신하는 엔드포인트입니다.

헤더:

- `X-OpenVidu-Token`: (선택) 공유 시크릿(서버에서 설정됨)
    

요청 본문:

- OpenVidu 웹훅 JSON payload (이벤트명은 `event` 필드에 포함)
    

응답:

- 성공 시 또는 payload 파싱에 실패해도 `200 OK`
    
- `X-OpenVidu-Token`이 서버에 설정되어 있고 값이 불일치하면 `401 Unauthorized`
    

---

원하면 다음도 해줄게:

- 이 문서를 **README/MkDocs 스타일로 더 “문서답게” 다듬기**(표/섹션 정리, 응답 코드 일관화)
    
- `ErrorResponse`의 필드명이 `StatusCode/Message`로 되어 있는데, 실제 JSON 프로퍼티가 `statusCode/message`면 문서도 그에 맞춰 정리하기