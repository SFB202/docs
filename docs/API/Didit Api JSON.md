# Didit Api JSON (2026 - 02 - 02)

Base path: `/api/v1` (default port: `8080`)  
Auth: Session Cookie `JSESSIONID` (GitHub OAuth2)

---

## 공통

### ErrorResponse (대부분 공통)

```json
{
  "statusCode": "NOT_FOUND",
  "message": "..."
}
```

---

## Schemas (Response JSON)

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

---

# Endpoints — Request / Response JSON

## Auth

### GET `/auth/login`

- Request: (none)
    
- Response: `302` redirect (JSON 없음)
    

### POST `/auth/logout`

- Request: (none)
    
- Response: `302` redirect (JSON 없음)
    

### GET `/auth/me`

**Response 200**

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

---

## Projects

### GET `/projects`

**Response 200**

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

### POST `/projects`

**Request**

```json
{
  "projectName": "my-project",
  "githubUrl": "https://github.com/org/repo"
}
```

**Response 200** (empty body)

---

### GET `/projects/{projectId}`

**Response 200**

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

### GET `/projects/recents`

**Response 200**

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

### GET `/projects/{projectId}/participants`

**Response 200**

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

**Request**

```json
{
  "projectId": 1,
  "expireDate": "2026-01-26T14:30:00"
}
```

**Response 200**

```json
"3fa85f64-5717-4562-b3fc-2c963f66afa6"
```

### GET `/projects/invites/{inviteCode}`

**Response 200**

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

### POST `/projects/invites/{inviteCode}`

- Request: (none)
    
- Response 200: (empty body)
    

---

## Meetings (Channels)

### POST `/projects/{projectId}/add-channel`

**Request**

```json
{
  "title": "Daily",
  "mode": "VOICE"
}
```

**Response 200**

```json
123
```

### POST `/projects/{projectId}/book-channel`

**Request**

```json
{
  "title": "Planning",
  "start": "2026-01-26T14:30:00",
  "end": "2026-01-26T15:30:00"
}
```

**Response 200**

```json
456
```

### GET `/projects/{projectId}/channels`

**Response 200**

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

### GET `/projects/{projectId}/channels/date`

**Response 200**

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

### GET `/channels/{channelId}`

**Response 200**

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

### PATCH `/channels/{channelId}`

**Request** (query params 기반, JSON body 없음)

- 예: `?title=Daily&start=2026-01-26T14:30:00&due=2026-01-26T15:30:00`
    

**Response 200** (empty body)

### DELETE `/channels/{channelId}`

**Response 200** (empty body)

---

### POST `/channels/{channelId}/webrtc`

**Response 200**

```json
"wss-token-or-openvidu-token-string"
```

### DELETE `/channels/{channelId}/webrtc`

**Response 200** (empty body)

### GET `/channels/{channelId}/webrtc/users`

**Response 200**

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

## Chat Messages

### POST `/channels/{channelId}/chats`

**Request**

```json
{
  "content": "Hello"
}
```

**Response 200** (empty body)

### GET `/channels/{channelId}/chats`

**Response 200**

```json
[
  {
    "id": 1000,
    "userId": 10,
    "messageType": "TEXT",
    "message": "Hello",
    "createdAt": "2026-01-26T14:30:00",
    "editedAt": null
  }
]
```

### PATCH `/channels/chats/{chatId}`

**Request**

```json
{
  "content": "Edited message"
}
```

**Response 200** (empty body)

### DELETE `/channels/chats/{chatId}`

**Response 200** (empty body)

---

## SSE

### GET `/channels/{channelId}/stream`

**Response 200** (`text/event-stream`)

#### `message` event data

```json
{
  "channelId": 1,
  "senderId": 10,
  "content": "Hello",
  "sentAtEpochMs": 1738209000000
}
```

#### `chat_update` event data

```json
{
  "chatId": 1000,
  "content": "Edited message",
  "editedAt": "2026-01-26T14:30:00"
}
```

#### `chat_delete` event data

```json
{
  "chatId": 1000,
  "content": "Original message"
}
```

---

## Issues

### GET `/projects/{projectId}/issues/active`

**Response 200**

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