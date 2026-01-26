# Didit API V3 JSON
## 공통

### ErrorResponse (대부분의 에러 응답 바디)

```json
{
  "statusCode": "NOT_FOUND",
  "message": "..."
}
```

> HTTP Status도 `statusCode`에 맞춰 설정됨

---

## Auth

### GET `/auth/login`

GitHub OAuth 로그인으로 리다이렉트

- **Request JSON**: 없음
    
- **Response JSON**: 없음
    
- **Response**: `302 Found` + `Location: /oauth2/authorization/github`
    

---

### POST `/auth/logout`

로그아웃(세션 무효화 + `JSESSIONID` 삭제)

- **Request JSON**: 없음
    
- **Response JSON**: 없음
    
- **Response**: `302 Found` → `/` (현재 설정)
    

---

## User

### GET `/user/me`

현재 인증된 사용자의 OAuth2 속성 반환 (Result 래퍼)

- **Request JSON**: 없음
    
- **Response `200 OK`**
    

```json
{
  "value": { "id": 999999, "login": "octocat" },
  "success": true,
  "errors": []
}
```

---

## Projects

### GET `/projects`

내 프로젝트 목록

- **Request JSON**: 없음
    
- **Response `200 OK`** (`ProjectResponse[]`)
    

```json
[
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
]
```

---

### POST `/projects`

프로젝트 생성 + 생성자를 `ADMIN`으로 등록

- **Request JSON**
    

```json
{
  "projectName": "my-project",
  "githubUrl": "https://github.com/org/repo"
}
```

- **Response `200 OK`**: 바디 없음
    
- **Validation**
    
    - `projectName` 최대 64
        
    - `githubUrl` URL 형식
        

---

### GET `/projects/{projectId}`

프로젝트 상세 조회 (+ 최근 조회 업데이트)

- **Request JSON**: 없음
    
- **Response `200 OK`** (`ProjectResponse`)
    

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

---

### GET `/projects/recents`

최근 조회 프로젝트 최대 4개

- **Request JSON**: 없음
    
- **Response `200 OK`** (`ProjectRecentResponse[]`)
    

```json
[
  {
    "id": 1,
    "user": {
      "id": 10,
      "githubId": 999999,
      "githubLogin": "octocat",
      "name": "Octo Cat",
      "avatarUrl": "https://...",
      "createdAt": "2026-01-26T14:30:00",
      "lastLoginAt": "2026-01-26T14:30:00"
    },
    "project": {
      "id": 1,
      "name": "my-project",
      "ownerId": 10,
      "repoId": 123456,
      "repoFullName": "org/repo",
      "thumbnailUrl": "https://...",
      "createdAt": "2026-01-26T14:30:00",
      "updatedAt": "2026-01-26T14:30:00"
    },
    "lastViewedAt": "2026-01-26T14:30:00"
  }
]
```

---

### GET `/projects/{projectId}/participants`

프로젝트 참여자 목록

- **Request JSON**: 없음
    
- **Response `200 OK`** (`UserResponse[]`)
    

```json
[
  {
    "id": 10,
    "githubId": 999999,
    "githubLogin": "octocat",
    "name": "Octo Cat",
    "avatarUrl": "https://...",
    "createdAt": "2026-01-26T14:30:00",
    "lastLoginAt": "2026-01-26T14:30:00"
  }
]
```

---

## Invites

### POST `/projects/invites`

프로젝트 초대 코드 생성(관리자)

- **Request JSON**
    

```json
{
  "projectId": 1,
  "expireDate": "2026-01-26T14:30:00"
}
```

> `expireDate`는 선택(없으면 서버가 매우 먼 미래로 설정)

- **Response `200 OK`** (UUID 문자열)
    

```json
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

---

### GET `/projects/invites/{inviteCode}`

초대코드로 프로젝트 조회

- **Request JSON**: 없음
    
- **Response `200 OK`** (`ProjectResponse`)
    

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

- **Errors**
    
    - `400 Bad Request`: `inviteCode`가 UUID 형식이 아님 → `ErrorResponse`
        

---

### POST `/projects/invites/{inviteCode}`

초대코드로 프로젝트 참여

- **Request JSON**: 없음
    
- **Response `200 OK`**: 바디 없음
    
- **Errors**
    
    - `400 Bad Request`: `inviteCode` UUID 형식 아님 → `ErrorResponse`
        

---

## Meetings (Channels)

### POST `/projects/{projectId}/add-channel`

회의(채널) 생성

- **Request JSON**
    

```json
{
  "title": "Daily",
  "mode": "VOICE"
}
```

- **Response `200 OK`** (생성된 meeting id)
    

```json
123
```

---

### GET `/projects/{projectId}/channels`

회의(채널) 목록 조회

- **Request JSON**: 없음
    
- **Query params**
    
    - `status` (optional): `SCHEDULED | RUNNING | ENDED`
        
    - `cursor` (권장): 이전 페이지 마지막 id, 첫 페이지 `0`
        
    - `page`, `size`, `sort` (`size` 기본 20)
        
- **Response `200 OK`** (`MeetingResponse[]`, `id DESC`)
    

```json
[
  {
    "id": 100,
    "project": {
      "id": 1,
      "name": "my-project",
      "ownerId": 10,
      "repoId": 123456,
      "repoFullName": "org/repo",
      "thumbnailUrl": "https://...",
      "createdAt": "2026-01-26T14:30:00",
      "updatedAt": "2026-01-26T14:30:00"
    },
    "createdBy": {
      "id": 10,
      "githubId": 999999,
      "githubLogin": "octocat",
      "name": "Octo Cat",
      "avatarUrl": "https://...",
      "createdAt": "2026-01-26T14:30:00",
      "lastLoginAt": "2026-01-26T14:30:00"
    },
    "sessionId": "uuid-string",
    "title": "Daily",
    "status": "SCHEDULED",
    "mode": "VOICE",
    "startedAt": "2026-01-26T14:30:00",
    "endedAt": "2026-01-26T15:00:00",
    "createdAt": "2026-01-26T14:30:00",
    "updatedAt": "2026-01-26T14:30:00"
  }
]
```

---

### GET `/channels/{channelId}`

회의 상세 조회

- **Request JSON**: 없음
    
- **Response `200 OK`** (`MeetingResponse`)
    

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

---

### PATCH `/channels/{channelId}`

회의 제목/시간 수정

- **Request JSON**: 없음 (쿼리 파라미터 방식)
    
- **Query params (optional)**: `title`, `start`, `due`
    
- **Response `200 OK`**: 바디 없음
    

> JSON 기반으로 바꾸고 싶다면 보통 아래처럼 Body DTO로 설계해도 됨(참고):

```json
{
  "title": "Daily",
  "start": "2026-01-26T14:30:00",
  "due": "2026-01-26T15:00:00"
}
```

---

### DELETE `/channels/{channelId}`

회의 삭제

- **Request JSON**: 없음
    
- **Response `200 OK`**: 바디 없음
    

---

## Issues

### GET `/projects/{projectId}/issues/active`

활성(OPEN) 이슈 최대 5개, `updatedAt DESC`

- **Request JSON**: 없음
    
- **Response `200 OK`** (`IssueResponse[]`)
    

```json
[
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
]
```

---