## 1) 공통 JSON 규격

## 1.1 ErrorResponse (에러 바디)

> 컨트롤러에서 `Result` 실패 시 `err.getResponse()`를 그대로 반환

```json
{
  "statusCode": "NOT_FOUND",
  "message": "찾을 수 없는 projectId"
}
```

- `statusCode`: Spring `HttpStatus` (문자열로 직렬화되는 경우가 일반적)
    
- `message`: 에러 메시지
    

---

## 1.2 Result (일부 API에서만 사용)

> `/api/v1/user/me` 는 `Result<Map<String,Object>>`를 직접 반환

```json
{
  "success": true,
  "value": { "anyKey": "anyValue" },
  "errors": []
}
```

- `success`: boolean
    
- `value`: T (성공 시 값)
    
- `errors`: 실패 정보 리스트
    

---

## 1.3 날짜/시간 포맷

- `LocalDateTime` → 보통 ISO-8601: `"2026-01-26T10:30:00"`
    

---

# 2) 모델(JSON)

## 2.1 AddProjectRequest (POST /api/v1/projects)

```json
{
  "projectName": "didit-room",
  "githubUrl": "https://github.com/org/repo"
}
```

- `projectName`: string, **max 64**, not null
    
- `githubUrl`: string(URL), not null
    

## 2.2 AddProjectInviteRequest (POST /api/v1/projects/invites)

```json
{
  "projectId": 1,
  "expireDate": "2026-02-01T12:00:00"
}
```

- `projectId`: number(long), not null
    
- `expireDate`: datetime, nullable
    
    - null이면 서버에서 `now + 1000 years`
        

## 2.3 CreateMeetingRequest (POST /api/v1/projects/{projectId}/add-channel)

```json
{
  "title": "Sprint Planning",
  "mode": "VOICE"
}
```

- `title`: string, **max 50**, not null
    
- `mode`: `"CHAT" | "VOICE"`, not null
    

## 2.4 ProjectResponse

```json
{
  "id": 1,
  "name": "didit-room",
  "ownerId": 10,
  "repoId": 999999,
  "repoFullName": "org/repo",
  "thumbnailUrl": "https://example.com/thumb.png",
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-26T09:00:00"
}
```

## 2.5 UserResponse

```json
{
  "id": 10,
  "githubId": 12345678,
  "githubLogin": "sfb202",
  "name": "Son",
  "avatarUrl": "https://avatars.githubusercontent.com/u/12345678",
  "createdAt": "2026-01-01T10:00:00",
  "lastLoginAt": "2026-01-26T09:50:00"
}
```

## 2.6 MeetingResponse

```json
{
  "id": 100,
  "project": { "id": 1, "name": "didit-room", "ownerId": 10, "repoId": 999999, "repoFullName": "org/repo", "thumbnailUrl": null, "createdAt": "2026-01-01T10:00:00", "updatedAt": "2026-01-26T09:00:00" },
  "createdBy": { "id": 10, "githubId": 12345678, "githubLogin": "sfb202", "name": "Son", "avatarUrl": null, "createdAt": "2026-01-01T10:00:00", "lastLoginAt": "2026-01-26T09:50:00" },
  "sessionId": "ov-session-abc123",
  "title": "Sprint Planning",
  "status": "SCHEDULED",
  "mode": "VOICE",
  "startedAt": "2026-01-26T10:00:00",
  "endedAt": "2026-01-26T11:00:00",
  "createdAt": "2026-01-26T09:00:00",
  "updatedAt": "2026-01-26T09:30:00"
}
```

- `status`: `"SCHEDULED" | "RUNNING" | "ENDED"`
    
- `mode`: `"CHAT" | "VOICE"`
    

---

# 3) 엔드포인트별 Request/Response(JSON)

## 3.1 GET /api/v1/auth/login

- Request Body: 없음
    
- Response: **Redirect** (JSON 없음)
    

---

## 3.2 POST /api/v1/auth/logout

- Request Body: 없음
    
- Response: **Redirect** (JSON 없음)
    

---

## 3.3 GET /api/v1/user/me

- Request Body: 없음
    
- Response(200): `Result<Map<String,Object>>` 형태
    

```json
{
  "success": true,
  "value": {
    "someOAuthAttr": "..."
  },
  "errors": []
}
```

- Response(401) 예시(실패 시 `Result.fail(...).throwIfFailure()` 흐름):
    

```json
{
  "statusCode": "UNAUTHORIZED",
  "message": "인증되지 않은 사용자입니다."
}
```

---

## 3.4 GET /api/v1/projects (내 프로젝트 목록)

- Request Body: 없음
    
- Response(200):
    

```json
[
  {
    "id": 1,
    "name": "didit-room",
    "ownerId": 10,
    "repoId": 999999,
    "repoFullName": "org/repo",
    "thumbnailUrl": null,
    "createdAt": "2026-01-01T10:00:00",
    "updatedAt": "2026-01-26T09:00:00"
  }
]
```

- Error 예시(404):
    

```json
{ "statusCode": "NOT_FOUND", "message": "찾을수 없는 userId" }
```

---

## 3.5 POST /api/v1/projects (프로젝트 생성)

- Request(JSON):
    

```json
{
  "projectName": "didit-room",
  "githubUrl": "https://github.com/org/repo"
}
```

- Response(200): 바디 없음
    
- Error 예시(407 중복 repoFullName):
    

```json
{ "statusCode": "PROXY_AUTHENTICATION_REQUIRED", "message": "중복되는 repoFullName" }
```

> **주의:** 서비스 주석이 `<407>`을 쓰고 있어 `HttpStatus.PROXY_AUTHENTICATION_REQUIRED(407)`로 내려갈 가능성이 큼.

---

## 3.6 POST /api/v1/projects/invites (초대코드 생성)

- Request(JSON):
    

```json
{
  "projectId": 1,
  "expireDate": "2026-02-01T12:00:00"
}
```

- Response(200): (일반적으로) UUID 문자열
    

```json
"550e8400-e29b-41d4-a716-446655440000"
```

- Error 예시(403/404):
    

```json
{ "statusCode": "FORBIDDEN", "message": "권한이 없습니다." }
```

---

## 3.7 GET /api/v1/projects/invites/{inviteCode} (초대코드로 프로젝트 조회)

- Request Body: 없음
    
- Response(200):
    

```json
{
  "id": 1,
  "name": "didit-room",
  "ownerId": 10,
  "repoId": 999999,
  "repoFullName": "org/repo",
  "thumbnailUrl": null,
  "createdAt": "2026-01-01T10:00:00",
  "updatedAt": "2026-01-26T09:00:00"
}
```

- Error(400): inviteCode UUID 파싱 실패 → **바디 없음**
    
- Error 예시(410 만료):
    

```json
{ "statusCode": "GONE", "message": "expire된 inviteCode" }
```

---

## 3.8 POST /api/v1/projects/invites/{inviteCode} (초대코드로 참여)

- Request Body: 없음
    
- Response(200): 바디 없음
    
- Error(400): inviteCode UUID 파싱 실패 → 바디 없음
    
- Error 예시(410 만료):
    

```json
{ "statusCode": "GONE", "message": "expire된 inviteCode" }
```

---

## 3.9 GET /api/v1/projects/{projectId}/participants (참여자 목록)

- Request Body: 없음
    
- Response(200):
    

```json
[
  {
    "id": 10,
    "githubId": 12345678,
    "githubLogin": "sfb202",
    "name": "Son",
    "avatarUrl": null,
    "createdAt": "2026-01-01T10:00:00",
    "lastLoginAt": "2026-01-26T09:50:00"
  }
]
```

- Error 예시(404):
    

```json
{ "statusCode": "NOT_FOUND", "message": "찾을수 없는 projectId" }
```

---

## 3.10 POST /api/v1/projects/{projectId}/add-channel (회의 생성)

- Request(JSON):
    

```json
{
  "title": "Sprint Planning",
  "mode": "CHAT"
}
```

- Response(200): 생성된 meeting PK (number)
    

```json
100
```

- Error 예시(403/404/400):
    

```json
{ "statusCode": "FORBIDDEN", "message": "해당 프로젝트에 생성 권한이 없는 사용자" }
```

---

## 3.11 GET /api/v1/projects/{projectId}/channels (회의 목록)

- Request Body: 없음
    
- Query: `status?`, `cursor?`, `page/size/sort`
    
- Response(200):
    

```json
[
  {
    "id": 100,
    "project": { "id": 1, "name": "didit-room", "ownerId": 10, "repoId": 999999, "repoFullName": "org/repo", "thumbnailUrl": null, "createdAt": "2026-01-01T10:00:00", "updatedAt": "2026-01-26T09:00:00" },
    "createdBy": { "id": 10, "githubId": 12345678, "githubLogin": "sfb202", "name": "Son", "avatarUrl": null, "createdAt": "2026-01-01T10:00:00", "lastLoginAt": "2026-01-26T09:50:00" },
    "sessionId": null,
    "title": "Sprint Planning",
    "status": "SCHEDULED",
    "mode": "VOICE",
    "startedAt": null,
    "endedAt": null,
    "createdAt": "2026-01-26T09:00:00",
    "updatedAt": "2026-01-26T09:30:00"
  }
]
```

- Error 예시(404):
    

```json
{ "statusCode": "NOT_FOUND", "message": "존재하지 않는 projectId" }
```

> **주의:** 컨트롤러는 `cursor`를 nullable로 받지만, 서비스 시그니처는 `long cursor`라서 **cursor를 생략하면 NPE 위험**이 있어. 문서/클라에서는 **첫 페이지 cursor=0** 권장.

---

## 3.12 GET /api/v1/channels/{channelId} (회의 단건)

- Request Body: 없음
    
- Response(200): `MeetingResponse` (위 2.6 예시 참고)
    
- Error 예시(403/404):
    

```json
{ "statusCode": "FORBIDDEN", "message": "프로젝트에 속해있지 않음" }
```

---

## 3.13 PATCH /api/v1/channels/{channelId} (회의 수정)

- Request Body: 없음
    
- Query: `title?`, `start?`, `due?` (LocalDateTime)
    
- Response(200): 바디 없음
    
- Error 예시(404):
    

```json
{ "statusCode": "NOT_FOUND", "message": "존재하지 않는 meetingId" }
```

---

## 3.14 DELETE /api/v1/channels/{channelId} (회의 삭제)

- Request Body: 없음
    
- Response(200): 바디 없음
    
- Error 예시(404):
    

```json
{ "statusCode": "NOT_FOUND", "message": "존재하지 않는 meetingId" }
```

---

원하면 다음 단계로, 이 JSON 문서를 그대로 기반으로 **“요청/응답 스키마 테이블(필드/타입/nullable/제약)”** 형태로도 깔끔하게 재정리해줄게.