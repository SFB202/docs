# Didit Server API (v2025-01-26)

Base path: `/api/v1` (기본 포트: `8080`)

## 인증(Authentication)

이 서버는 Spring Security OAuth2(GitHub)를 사용하며, 세션 쿠키(`JSESSIONID`) 기반으로 인증합니다.

- `GET /api/v1/auth/login`: GitHub OAuth 인가(`/oauth2/authorization/github`)로 리다이렉트합니다.
    
- `POST /api/v1/auth/logout`: 세션을 무효화하고 `JSESSIONID` 쿠키를 삭제합니다(`SecurityConfig`에 설정됨).
    

기본적으로 모든 엔드포인트는 인증이 필요하며, 아래 경로만 예외로 인증 없이 접근 가능합니다:  
`/`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/login/**`, `/oauth2/**`.

## 규칙(Conventions)

- 요청/응답 본문: JSON (별도 표기 없는 한)
    
- 타임스탬프: ISO-8601 `LocalDateTime` (예: `2026-01-26T14:30:00`)
    
- 열거형(Enum):
    
    - `MeetingMode`: `CHAT | VOICE`
        
    - `MeetingStatus`: `SCHEDULED | RUNNING | ENDED`
        
    - `IssueStatus`: `OPEN | CLOSED`
        
    - `IssuePriority`: `HIGH | MEDIUM | LOW`
        

### 에러 응답(Error response)

대부분의 엔드포인트는 `ErrorResponse` 형태로 에러 바디를 반환합니다:

```json
{
  "statusCode": "NOT_FOUND",
  "message": "..."
}
```

HTTP 상태 코드도 동일한 상태 코드로 설정됩니다.

## 스키마(응답 Schemas)

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

## 엔드포인트(Endpoints)

### Auth

#### `GET /api/v1/auth/login`

GitHub OAuth 로그인 플로우로 리다이렉트합니다.

응답:

- `302 Found` + `Location: /oauth2/authorization/github`
    

#### `POST /api/v1/auth/logout`

로그아웃 처리(세션 무효화; `JSESSIONID` 제거).

응답:

- `302 Found` 로 `/` 리다이렉트(현재 설정)
    

### User

#### `GET /api/v1/user/me`

현재 인증된 사용자의 OAuth2 속성(attributes)을 반환합니다.

응답:

- `200 OK`
    

```json
{
  "value": { "id": 999999, "login": "octocat" },
  "success": true,
  "errors": []
}
```

### Projects

#### `GET /api/v1/projects`

인증된 사용자의 프로젝트 목록을 조회합니다.

응답:

- `200 OK` -> `ProjectResponse[]`
    

#### `POST /api/v1/projects`

프로젝트를 생성하고 생성자를 `ADMIN`으로 등록합니다.

요청 바디:

```json
{
  "projectName": "my-project",
  "githubUrl": "https://github.com/org/repo"
}
```

비고:

- 검증: `projectName` 최대 64, `githubUrl`은 유효한 URL이어야 함
    

응답:

- `200 OK` (빈 바디)
    

#### `GET /api/v1/projects/{projectId}`

프로젝트 상세를 조회합니다(인증된 사용자의 최근 조회도 함께 업데이트).

응답:

- `200 OK` -> `ProjectResponse`
    

#### `GET /api/v1/projects/recents`

인증된 사용자의 최근 조회 프로젝트를 최대 4개까지 조회합니다.

응답:

- `200 OK` -> `ProjectRecentResponse[]`
    

#### `GET /api/v1/projects/{projectId}/participants`

프로젝트 참여자 목록을 조회합니다.

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

- `expireDate`는 선택이며, 생략 시 서버가 매우 먼 미래로 설정합니다.
    

응답:

- `200 OK` -> 초대 코드(UUID)
    

```json
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

#### `GET /api/v1/projects/invites/{inviteCode}`

초대 코드로 프로젝트를 조회합니다.

응답:

- `200 OK` -> `ProjectResponse`
    
- `400 Bad Request`: `inviteCode`가 UUID 형식이 아니면
    

#### `POST /api/v1/projects/invites/{inviteCode}`

초대 코드로 프로젝트에 참여합니다.

응답:

- `200 OK` (빈 바디)
    
- `400 Bad Request`: `inviteCode`가 UUID 형식이 아니면
    

### Meetings (Channels)

#### `POST /api/v1/projects/{projectId}/add-channel`

프로젝트에 회의(채널)를 생성합니다.

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

#### `POST /api/v1/projects/{projectId}/book-channel`

프로젝트에 회의(채널)를 예약 생성합니다.

요청 바디:

```json
{
  "title": "Planning",
  "start": "2026-01-26T14:30:00",
  "end": "2026-01-26T15:30:00"
}
```

비고:

- 검증: `title` 최대 50, `start`/`end`는 미래 시간이어야 함
    
- `start`가 `end`보다 늦으면 서버가 요청을 거절합니다.
    
- 회의는 `status=SCHEDULED`, `mode=VOICE`로 저장됩니다(현재 구현 기준).
    

응답:

- `200 OK` -> 생성된 meeting id
    

```json
456
```

#### `GET /api/v1/projects/{projectId}/channels`

프로젝트의 회의(채널) 목록을 조회합니다.

쿼리 파라미터:

- `status`(선택): `SCHEDULED | RUNNING | ENDED`
    
- `cursor`(권장): 이전 페이지의 마지막 아이템 id (첫 페이지는 `0`)
    
- `page`, `size`, `sort`: Spring `Pageable` 파라미터(`size` 기본값: `20`)
    

응답:

- `200 OK` -> `MeetingResponse[]` (`id` 내림차순 정렬)
    

#### `GET /api/v1/projects/{projectId}/channels/date`

프로젝트 내 특정 기간의 회의(채널) 목록을 조회합니다.

쿼리 파라미터(필수):

- `start` (ISO-8601 `LocalDateTime`)
    
- `end` (ISO-8601 `LocalDateTime`)
    

응답:

- `200 OK` -> `MeetingResponse[]` (`id` 내림차순 정렬)
    

#### `GET /api/v1/channels/{channelId}`

회의(채널) 상세를 조회합니다.

응답:

- `200 OK` -> `MeetingResponse`
    

#### `PATCH /api/v1/channels/{channelId}`

회의(채널) 제목 및/또는 시간 범위를 수정합니다.

쿼리 파라미터(모두 선택):

- `title` (string)
    
- `start` (ISO-8601 `LocalDateTime`)
    
- `due` (ISO-8601 `LocalDateTime`)
    

응답:

- `200 OK` (빈 바디)
    

#### `DELETE /api/v1/channels/{channelId}`

회의(채널)를 삭제합니다.

응답:

- `200 OK` (빈 바디)
    

### Issues

#### `GET /api/v1/projects/{projectId}/issues/active`

프로젝트의 활성(OPEN) 이슈를 최대 5개까지 조회하며, `updatedAt` 내림차순으로 정렬합니다.

응답:

- `200 OK` -> `IssueResponse[]`