# Didit Server API (2026 - 02 - 05 저녁)

Base path: `/api/v1` (기본 포트: `8080`)

## 인증 (Authentication)

이 서버는 Spring Security OAuth2(GitHub)를 사용하며, 세션 쿠키(`JSESSIONID`) 기반으로 인증합니다.

- `GET /api/v1/auth/login`: GitHub OAuth 인가 엔드포인트(`/oauth2/authorization/github`)로 리다이렉트합니다.
    
- `POST /api/v1/auth/logout`: 세션을 무효화하고 `JSESSIONID` 쿠키를 제거합니다.
    
- `GET /api/v1/auth/me`: 현재 인증된 사용자(`UserResponse`)를 반환합니다.
    

기본적으로 **모든 엔드포인트는 인증이 필요**하며, 아래 경로만 예외로 인증 없이 접근 가능합니다:

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
    

## 규칙 (Conventions)

- 요청/응답 본문: JSON (별도 표기 없는 한)
    
- 시간 포맷: ISO-8601 `LocalDateTime` (예: `2026-01-26T14:30:00`)
    
- 페이지네이션: Spring `Pageable` 파라미터(`page`, `size`, `sort`)
    
- 커서: 일부 엔드포인트는 이전 페이지의 마지막 항목 id를 `lastId` 또는 `cursor`로 받습니다.
    

## Redis 통신 (Redis Communication)

이 서비스는 Redis를 비동기 메시징(pub/sub)과 큐(리스트) 용도로 사용합니다. 페이로드는 **JSON 문자열**입니다.

### Pub/Sub 토픽 (서버로 “들어오는” 토픽, inbound)

- `issue:priority:result_topic`
    
    - 목적: AI 이슈 우선순위 분석 결과
        
    - 페이로드:
        
    
    ```json
    {
      "userId": 10,
      "issueId": 100,
      "priority": "HIGH"
    }
    ```
    
    - 동작: 서버는 요청한 사용자 세션에만 `ai_analysis_result` SSE를 전송합니다.
        
- `issue:priority:sort_result_topic`
    
    - 목적: AI 이슈 정렬 결과
        
    - 페이로드:
        
    
    ```json
    {
      "userId": 10,
      "projectId": 1,
      "issueIds": [100, 101, 102]
    }
    ```
    
    - 동작: 서버는 프로젝트 스트림으로 `ai_sort_result` SSE를 브로드캐스트합니다.
        
- `media:summary:generated`
    
    - 목적: 미디어 요약 생성 완료 이벤트
        
    - 페이로드:
        
    
    ```json
    {
      "summeryId": 900,
      "status": "DONE",
      "summary": "## Summary\n- ..."
    }
    ```
    
    - 비고:
        
        - 필드명이 현재 `summeryId` 입니다(오타지만 서버 코드와 동일하게 유지).
            
        - 수신 시 서버는 회의 요약을 업데이트하고, 프로젝트 스트림으로 `media_summary_generated` SSE를 전송합니다.
            

### 큐 키 (서버에서 “나가는” 큐, outbound)

- `queue:media:summary:download`
    
    - 목적: 요약 생성 파이프라인에 녹화 다운로드 URL 전달
        
    - 페이로드:
        
    
    ```json
    {
      "summaryId": 900,
      "downloadUrl": "https://..."
    }
    ```
    
    - Push 방식: `LPUSH` (left push)
        

### 내부 세션 키

- `sse:client_key:{userId}`
    
    - 목적: 특정 사용자에게만 AI 분석 결과를 보내기 위한 per-user SSE client key 저장
        
    - TTL: 30분
        

### Enum 목록

- `MeetingMode`: `CHAT | VOICE`
    
- `MeetingStatus`: `SCHEDULED | RUNNING | ENDED`
    
- `IssueStatus`: `OPEN | CLOSED`
    
- `IssuePriority`: `HIGH | MEDIUM | LOW`
    
- `MessageType`: `TEXT | SYSTEM`
    

### 에러 응답

대부분의 엔드포인트는 에러 시 `ErrorResponse` 바디를 반환합니다.

```json
{
  "StatusCode": "NOT_FOUND",
  "Message": "..."
}
```

HTTP 상태 코드도 위 `StatusCode`에 대응하는 값으로 설정됩니다.

## 스키마 (응답)

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

### MeetingSummaryResponse

```json
{
  "id": 900,
  "title": "Daily - 2026-02-05T09:30:00",
  "meetingId": 100,
  "summaryMd": "## Summary\n- ...",
  "publishedAt": "2026-02-05T09:35:00",
  "summaryVersion": 2,
  "editedBy": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" },
  "generatedAt": "2026-02-05T09:35:00",
  "createdAt": "2026-02-05T09:35:00",
  "updatedAt": "2026-02-05T09:40:00"
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

## 엔드포인트 (Endpoints)

## Auth

### `GET /api/v1/auth/login`

GitHub OAuth 로그인 플로우로 리다이렉트합니다.

응답:

- `302 Found` + `Location: /oauth2/authorization/github`
    

### `POST /api/v1/auth/logout`

로그아웃 처리(세션 무효화, `JSESSIONID` 제거).

응답:

- `200 OK` (빈 바디)
    

### `GET /api/v1/auth/me`

현재 인증된 사용자 반환.

응답:

- `200 OK` -> `UserResponse`
    
- `401 Unauthorized` (로그인 안 함)
    

## Projects

### `GET /api/v1/projects`

인증된 사용자가 속한 프로젝트 목록을 조회합니다.

응답:

- `200 OK` -> `ProjectResponse[]`
    

### `POST /api/v1/projects`

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

- `200 OK` (빈 바디)
    

### `GET /api/v1/projects/{projectId}`

프로젝트 상세 조회(동시에 인증된 사용자의 최근 조회 프로젝트도 갱신).

응답:

- `200 OK` -> `ProjectResponse`
    

### `GET /api/v1/projects/recents`

인증된 사용자의 최근 조회 프로젝트 최대 4개 조회.

응답:

- `200 OK` -> `ProjectRecentResponse[]`
    

### `GET /api/v1/projects/{projectId}/participants`

프로젝트 참여자 목록 조회.

응답:

- `200 OK` -> `UserResponse[]`
    

### `DELETE /api/v1/projects/{projectId}`

프로젝트 삭제(소유자만).

응답:

- `200 OK` (빈 바디)
    

### `DELETE /api/v1/projects/{projectId}/leave`

프로젝트 나가기.

응답:

- `200 OK` (빈 바디)
    

### `DELETE /api/v1/projects/{projectId}/participants/{userId}`

프로젝트에서 참여자 제거(소유자만).

응답:

- `200 OK` (빈 바디)
    

### `POST /api/v1/projects/{projectId}/github/validate`

프로젝트에 사용할 GitHub 저장소를 검증합니다.

요청 바디:

```json
{
  "orgName": "org",
  "repoName": "repo"
}
```

응답:

- `200 OK` -> `GithubRepoResponse`
    

### `PATCH /api/v1/projects/{projectId}`

프로젝트 저장소 정보 업데이트.

요청 바디:

```json
{
  "repoId": 123456,
  "repoFullName": "org/repo"
}
```

응답:

- `200 OK` (빈 바디)
    

### `PATCH /api/v1/projects/{projectId}/owner`

프로젝트 소유권 이전.

요청 바디:

```json
{
  "newOwnerId": 99
}
```

응답:

- `200 OK` (빈 바디)
    

### `PATCH /api/v1/projects/{projectId}/name`

프로젝트 이름 변경.

요청 바디:

```json
{
  "name": "new-project-name"
}
```

비고:

- 검증: `name` 필수, 최대 100자
    

응답:

- `200 OK` (빈 바디)
    

## Invites

### `POST /api/v1/projects/invites`

프로젝트 초대 코드를 생성(관리자만).

요청 바디:

```json
{
  "projectId": 1,
  "expireDate": "2026-01-26T14:30:00"
}
```

비고:

- `expireDate`는 선택이며, 생략하면 서버가 매우 먼 미래로 설정합니다.
    

응답:

- `200 OK` -> 초대 코드(UUID)
    

```json
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

### `GET /api/v1/projects/invites/{inviteCode}`

초대 코드로 프로젝트 조회.

응답:

- `200 OK` -> `ProjectResponse`
    
- `400 Bad Request` (inviteCode가 UUID 형식이 아님)
    

### `POST /api/v1/projects/invites/{inviteCode}`

초대 코드로 프로젝트 참여.

응답:

- `200 OK` (빈 바디)
    
- `400 Bad Request` (inviteCode가 UUID 형식이 아님)
    

## Meetings (Channels)

### `POST /api/v1/projects/{projectId}/add-channel`

프로젝트에 회의(채널) 생성(관리자만). 생성 시 상태는 `RUNNING`.

요청 바디:

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

프로젝트에 회의(채널) 예약(관리자만). 생성 시 상태는 `SCHEDULED`, 모드는 `VOICE`.

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
    
- `start`가 `end`보다 늦으면 요청을 거절합니다.
    

응답:

- `200 OK` -> 생성된 meeting id
    

```json
456
```

### `GET /api/v1/projects/{projectId}/channels`

프로젝트의 회의(채널) 목록 조회.

쿼리 파라미터:

- `status`(선택): `SCHEDULED | RUNNING | ENDED`
    
- `cursor`(권장): 이전 페이지 마지막 항목 id (첫 페이지는 `0`)
    
- `page`, `size`, `sort`: Spring `Pageable` (`size` 기본값: `20`)
    

응답:

- `200 OK` -> `MeetingResponse[]` (`id` 내림차순)
    

### `GET /api/v1/projects/{projectId}/channels/date`

프로젝트에서 특정 기간 내 회의(채널) 목록 조회.

쿼리 파라미터(필수):

- `start` (ISO-8601 `LocalDateTime`)
    
- `end` (ISO-8601 `LocalDateTime`)
    

응답:

- `200 OK` -> `MeetingResponse[]` (`id` 내림차순)
    

### `GET /api/v1/channels/{channelId}`

회의(채널) 상세 조회.

응답:

- `200 OK` -> `MeetingResponse`
    

### `PATCH /api/v1/channels/{channelId}`

회의(채널) 제목 및/또는 시간 범위 수정.

쿼리 파라미터(모두 선택):

- `title`(string)
    
- `start`(ISO-8601 `LocalDateTime`)
    
- `due`(ISO-8601 `LocalDateTime`, 종료 시간)
    

응답:

- `200 OK` (빈 바디)
    

### `DELETE /api/v1/channels/{channelId}`

회의(채널) 삭제.

응답:

- `200 OK` (빈 바디)
    

### `POST /api/v1/channels/{channelId}/webrtc`

VOICE 회의 참여(미디어 커넥션 생성 + 참여 상태 마킹).

응답:

- `200 OK` -> connection token (string)
    
- `409 Conflict` (회의 모드가 `VOICE`가 아님)
    

### `DELETE /api/v1/channels/{channelId}/webrtc`

VOICE 회의 나가기(미디어 커넥션 종료 + 퇴장 상태 마킹).

응답:

- `200 OK` (빈 바디)
    
- `409 Conflict` (회의 모드가 `VOICE`가 아님)
    

### `GET /api/v1/channels/{channelId}/webrtc/users`

VOICE 회의에 연결된 사용자 목록 조회.

응답:

- `200 OK` -> `UserResponse[]`
    
- `409 Conflict` (회의 모드가 `VOICE`가 아님)
    

### `POST /api/v1/channels/{channelId}/recording/start`

VOICE 회의 녹화 시작.

응답:

- `200 OK` -> recording id (long)
    

```json
789
```

### `POST /api/v1/channels/{channelId}/recording/stop/{recordId}`

VOICE 회의 녹화 중단.

응답:

- `200 OK` (빈 바디)
    

## Chat Messages

### `POST /api/v1/channels/{channelId}/chats`

채널에 채팅 메시지 전송.

요청 바디:

```json
{
  "content": "Hello"
}
```

응답:

- `200 OK` (빈 바디)
    

### `GET /api/v1/channels/{channelId}/chats`

채널의 채팅 메시지 목록 조회.

쿼리 파라미터:

- `lastId`(선택): 이전 페이지 마지막 채팅 id
    
- `page`, `size`, `sort`: Spring `Pageable` (`size` 기본값: `20`)
    

응답:

- `200 OK` -> `ChatResponse[]` (`id` 오름차순)
    

### `PATCH /api/v1/channels/chats/{chatId}`

채팅 메시지 수정(작성자만).

요청 바디:

```json
{
  "content": "Edited message"
}
```

응답:

- `200 OK` (빈 바디)
    

### `DELETE /api/v1/channels/chats/{chatId}`

채팅 메시지 삭제(작성자만).

응답:

- `200 OK` (빈 바디)
    

## SSE (Server-Sent Events)

### `GET /api/v1/channels/{channelId}/stream`

채널의 실시간 이벤트를 구독합니다. 사용자는 해당 채널이 속한 프로젝트 멤버여야 합니다.

응답:

- `200 OK` + `Content-Type: text/event-stream`
    
- `403 Forbidden` (멤버가 아님)
    

Emitter 동작:

- 타임아웃: 30분(클라이언트는 재연결 권장)
    
- Keep-alive: 20초마다 `ping` 이벤트
    

이벤트:

- `message`: 새 채팅 메시지
    
- `chat_update`: 채팅 메시지 수정
    
- `chat_delete`: 채팅 메시지 삭제
    
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

비고:

- `chat_update`, `chat_delete`는 현재 `projectId`를 channel id로 사용해 브로드캐스트됩니다. 해당 업데이트를 받아야 하는 클라이언트는 `/api/v1/channels/{projectId}/stream`도 함께 구독해야 합니다.
    

### `GET /api/v1/projects/{projectId}/stream`

프로젝트 단위 이벤트를 구독합니다. 사용자는 프로젝트 멤버여야 합니다.

응답:

- `200 OK` + `Content-Type: text/event-stream`
    
- `403 Forbidden` (멤버가 아님)
    

Emitter 동작:

- 타임아웃: 30분(클라이언트 재연결 권장)
    
- Keep-alive: 20초마다 `ping` 이벤트
    

이벤트:

- `ai_sort_result`: AI 정렬 후 이슈 id 목록(정렬된 순서)
    
- `ai_analysis_result`: 단일 이슈 우선순위 분석 결과
    
- `media_summary_generated`: 프로젝트의 미디어 요약 생성 완료
    
- `ping`
    

`ai_sort_result` data:

```json
[100, 101, 102]
```

`ai_analysis_result` data:

```json
{
  "issueId": 100,
  "title": null,
  "body": null,
  "status": null,
  "priority": "MEDIUM",
  "assigneeIds": null
}
```

`media_summary_generated` data:

```json
{
  "projectId": 1,
  "summaryId": 900
}
```

비고:

- `GET /api/v1/projects/{projectId}/issues/active`는 정렬 작업을 큐에 넣고, 비동기 결과가 도착하면 `ai_sort_result`를 발생시킵니다.
    
- `ai_analysis_result`는 요청한 사용자에게만(per-session client key) 전달됩니다.
    

## Issues

### `GET /api/v1/projects/{projectId}/issues/active`

프로젝트의 활성(OPEN) 이슈 최대 5개를 `updatedAt` 내림차순으로 조회.

응답:

- `200 OK` -> `IssueResponse[]`
    

비고:

- 조회와 함께 해당 이슈들에 대한 AI 정렬 작업도 큐에 넣습니다.
    

### `GET /api/v1/projects/{projectId}/issues`

프로젝트의 모든 이슈 조회.

응답:

- `200 OK` -> `IssueResponse[]`
    

### `POST /api/v1/projects/{projectId}/issue/analyze`

이슈 우선순위를 분석합니다(드래프트 이슈 생성 + AI 분석 작업 큐잉).

요청 바디:

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

(analyze로 생성된) 드래프트 이슈로 GitHub 이슈를 생성합니다.

요청 바디:

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

비고:

- `issueId`는 **같은 작성자가 analyze로 만든 기존 드래프트 이슈**여야 합니다.
    
- `issueStatus`는 입력을 받지만 현재 서버에서는 사용하지 않습니다.
    

응답:

- `200 OK` -> `IssueResponse[]` (0 또는 1개)
    

### `PATCH /api/v1/projects/{projectId}/issues/{issueId}`

이슈 수정(작성자만).

요청 바디:

```json
{
  "title": "Updated title",
  "body": "Updated body",
  "assigneeIds": [10]
}
```

응답:

- `200 OK` (빈 바디)
    

### `DELETE /api/v1/projects/{projectId}/issues/{issueId}`

이슈 삭제(작성자만).

응답:

- `200 OK` (빈 바디)
    

## Meeting Summaries

### `GET /api/v1/projects/{projectId}/summary`

프로젝트의 회의 요약 목록 조회.

응답:

- `200 OK` -> `MeetingSummaryResponse[]` (`createdAt` 내림차순)
    

### `PATCH /api/v1/projects/{projectId}/summary/{summaryId}`

회의 요약 수정(프로젝트 멤버만).

요청 바디:

```json
{
  "title": "Daily - 2026-02-05",
  "summary": "## Summary\n- ..."
}
```

비고:

- 비어있지 않은 필드만 해당 값으로 업데이트합니다.
    
- 업데이트 시 `summaryVersion`이 증가합니다.
    

응답:

- `200 OK` (빈 바디)
    

### `DELETE /api/v1/projects/{projectId}/summary/{summaryId}`

회의 요약 삭제(프로젝트 관리자만).

응답:

- `200 OK` (빈 바디)
    

## Webhooks

### `POST /api/v1/webhooks/openvidu`

OpenVidu 서버 웹훅 엔드포인트.

헤더:

- `X-OpenVidu-Token`: 선택적 공유 시크릿(서버 설정에 따라 검증)
    

요청 바디:

- OpenVidu 웹훅 JSON 페이로드(`event` 필드에 이벤트 이름 포함)
    

응답:

- `200 OK`: 성공 시 또는 페이로드 파싱이 실패해도 반환
    
- `401 Unauthorized`: `X-OpenVidu-Token`이 서버에 설정되어 있고, 요청 값이 일치하지 않는 경우