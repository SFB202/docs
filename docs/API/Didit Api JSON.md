# Didit API V2026-01-26 JSON
## 0) 공통

### Timestamp 형식

```json
"2026-01-26T14:30:00"
```

### ErrorResponse (대부분 공통)

```json
{
  "statusCode": "NOT_FOUND",
  "message": "..."
}
```

### Enums

```json
{
  "MeetingMode": ["CHAT", "VOICE"],
  "MeetingStatus": ["SCHEDULED", "RUNNING", "ENDED"],
  "IssueStatus": ["OPEN", "CLOSED"],
  "IssuePriority": ["HIGH", "MEDIUM", "LOW"]
}
```

---

## 1) 응답 스키마(JSON)

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

---

## 2) 엔드포인트별 JSON 정리

> 형식: **Request JSON → Response JSON (성공) → Error JSON (있으면)**

---

### Auth

#### `GET /api/v1/auth/login`

- Request: 없음
    
- Response: (리다이렉트)
    

```json
{
  "status": 302,
  "headers": { "Location": "/oauth2/authorization/github" }
}
```

#### `POST /api/v1/auth/logout`

- Request: 없음
    
- Response: (리다이렉트)
    

```json
{
  "status": 302,
  "headers": { "Location": "/" }
}
```

---

### User

#### `GET /api/v1/user/me`

- Request: 없음
    
- Response:
    

```json
{
  "value": { "id": 999999, "login": "octocat" },
  "success": true,
  "errors": []
}
```

---

### Projects

#### `GET /api/v1/projects`

- Request: 없음
    
- Response:
    

```json
[
  { "id": 1, "name": "my-project", "ownerId": 10, "repoId": 123456, "repoFullName": "org/repo", "thumbnailUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "updatedAt": "2026-01-26T14:30:00" }
]
```

#### `POST /api/v1/projects`

- Request:
    

```json
{
  "projectName": "my-project",
  "githubUrl": "https://github.com/org/repo"
}
```

- Response:
    

```json
{}
```

#### `GET /api/v1/projects/{projectId}`

- Request: 없음
    
- Response:
    

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

#### `GET /api/v1/projects/recents`

- Request: 없음
    
- Response:
    

```json
[
  {
    "id": 1,
    "user": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" },
    "project": { "id": 1, "name": "my-project", "ownerId": 10, "repoId": 123456, "repoFullName": "org/repo", "thumbnailUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "updatedAt": "2026-01-26T14:30:00" },
    "lastViewedAt": "2026-01-26T14:30:00"
  }
]
```

#### `GET /api/v1/projects/{projectId}/participants`

- Request: 없음
    
- Response:
    

```json
[
  { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" }
]
```

---

### Invites

#### `POST /api/v1/projects/invites`

- Request:
    

```json
{
  "projectId": 1,
  "expireDate": "2026-01-26T14:30:00"
}
```

- Response:
    

```json
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

#### `GET /api/v1/projects/invites/{inviteCode}`

- Request: 없음
    
- Response:
    

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

- Error(예: UUID 아님):
    

```json
{
  "statusCode": "BAD_REQUEST",
  "message": "..."
}
```

#### `POST /api/v1/projects/invites/{inviteCode}`

- Request: 없음
    
- Response:
    

```json
{}
```

- Error(예: UUID 아님):
    

```json
{
  "statusCode": "BAD_REQUEST",
  "message": "..."
}
```

---

### Meetings (Channels)

#### `POST /api/v1/projects/{projectId}/add-channel`

- Request:
    

```json
{
  "title": "Daily",
  "mode": "VOICE"
}
```

- Response:
    

```json
123
```

#### `POST /api/v1/projects/{projectId}/book-channel`

- Request:
    

```json
{
  "title": "Planning",
  "start": "2026-01-26T14:30:00",
  "end": "2026-01-26T15:30:00"
}
```

- Response:
    

```json
456
```

#### `GET /api/v1/projects/{projectId}/channels`

- Request: 없음
    
- Response:
    

```json
[
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
]
```

#### `GET /api/v1/projects/{projectId}/channels/date`

- Request: 없음
    
- Response:
    

```json
[
  { "id": 100, "project": { "id": 1, "name": "my-project", "ownerId": 10, "repoId": 123456, "repoFullName": "org/repo", "thumbnailUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "updatedAt": "2026-01-26T14:30:00" }, "createdBy": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-26T14:30:00", "lastLoginAt": "2026-01-26T14:30:00" }, "sessionId": "uuid-string", "title": "Daily", "status": "SCHEDULED", "mode": "VOICE", "startedAt": "2026-01-26T14:30:00", "endedAt": "2026-01-26T15:00:00", "createdAt": "2026-01-26T14:30:00", "updatedAt": "2026-01-26T14:30:00" }
]
```

#### `GET /api/v1/channels/{channelId}`

- Request: 없음
    
- Response:
    

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

#### `PATCH /api/v1/channels/{channelId}`

- Request body: 없음 (Query로 수정)
    
- Response:
    

```json
{}
```

#### `DELETE /api/v1/channels/{channelId}`

- Request: 없음
    
- Response:
    

```json
{}
```

---

### Issues

#### `GET /api/v1/projects/{projectId}/issues/active`

- Request: 없음
    
- Response:
    

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
