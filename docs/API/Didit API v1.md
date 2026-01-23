
# Didit API 문서 V2 (Updated)

## Base

- Base URL: `/`
    
- API Prefix: `/api/v1`
    

## 인증 / 보안 (SecurityConfig 기준)

### 인증 방식

- Spring Security OAuth2 Login(GitHub) + 세션 쿠키(`JSESSIONID`)
    
- 로그인 성공 시 기본 리다이렉트: `/`
    

### Public (인증 없이 접근 가능)

SecurityConfig에서 `permitAll()`로 열려있는 경로:

- `GET /`
    
- `GET /api/v1/auth/login`
    
- `/api/v1/auth/logout` _(logoutUrl로도 사용됨)_
    
- `/login/**`
    
- `/oauth2/**`
    

> 위 목록 **외 모든 API는 인증 필요** (`anyRequest().authenticated()`)

### 로그아웃

- SecurityConfig에서 처리
    
- `logoutUrl`: `/api/v1/auth/logout`
    
- 세션 invalidate + `JSESSIONID` 쿠키 삭제 + `/`로 리다이렉트
    

> HTTP 메서드(POST/GET)는 프로젝트 설정/필터에 따라 달라질 수 있어. 문서상으로는 일반적으로 **POST**를 권장.

---

## 공통 응답: ErrorResponse

서비스 레이어 `Result` 실패 시 Controller는 아래 형태의 에러를 내려줌:

```json
{
  "statusCode": "NOT_FOUND",
  "message": "..."
}
```

- `statusCode`: `HttpStatus` (예: `NOT_FOUND`, `FORBIDDEN`, `BAD_REQUEST`, `GONE` 등)
    
- `message`: 에러 메시지
    

> `ErrorResponse.java`의 필드명이 `StatusCode`, `Message`(대문자 시작)지만, Lombok getter 기준으로 보통 JSON은 `statusCode`, `message`로 직렬화되는 케이스가 많음.

---

# 1) Auth API

## 1.1 로그인 시작 (GitHub OAuth 리다이렉트)

- **GET** `/api/v1/auth/login`
    
- **Auth**: ❌ 불필요 (Public)
    

### Response

- **302 Redirect**
    
- `Location: /oauth2/authorization/github`
    

---

## 1.2 내 세션 확인 (테스트)

- **GET** `/api/v1/user/me`
    
- **Auth**: ✅ 필요
    

### Response

`Result<Map<String,Object>>` 형태로 GitHub attributes 반환

성공 예시:

```json
{
  "value": {
    "id": 123456,
    "login": "octocat",
    "name": "Octo Cat",
    "avatar_url": "https://..."
  },
  "success": true,
  "errors": []
}
```

실패(비인증) 시:

- 코드상 `Result.fail(401, "...").throwIfFailure()` 호출 → 예외 처리 흐름은 전역 예외 핸들러 구성에 따라 달라짐
    

---

# 2) Projects API (`/api/v1/projects`)

## 2.1 프로젝트 목록 조회

- **GET** `/api/v1/projects`
    
- **Auth**: ✅ 필요
    

### Response

- **200** `ProjectResponse[]`
    

예시:

```json
[
  {
    "id": 1,
    "name": "didit",
    "ownerId": 10,
    "repoId": 123456,
    "repoFullName": "org/repo",
    "thumbnailUrl": null,
    "createdAt": "2026-01-22T10:00:00",
    "updatedAt": "2026-01-22T10:10:00"
  }
]
```

### Error

- 실패 시 `ErrorResponse` + 해당 HTTP Status
    

---

## 2.2 프로젝트 생성

- **POST** `/api/v1/projects`
    
- **Auth**: ✅ 필요
    
- **Body**: `AddProjectRequest`
    

### Request Body

```json
{
  "projectName": "didit",
  "githubUrl": "https://github.com/org/repo"
}
```

### Validation (DTO 기준)

- `projectName`: `@NotNull`, `@Size(max=64)`
    
- `githubUrl`: `@NotNull`, `@URL`
    

### Response

- **200** (Body 없음)
    
- 실패 시 `ErrorResponse` + 해당 HTTP Status
    
    - 서비스 주석 기준: `404 userId`, `407 repoFullName 중복` 등
        

---

## 2.3 프로젝트 초대 코드 생성

- **POST** `/api/v1/projects/invites`
    
- **Auth**: ✅ 필요
    
- **Body**: `AddProjectInviteRequest`
    

### Request Body

```json
{
  "projectId": 1,
  "expireDate": "2026-02-01T00:00:00"
}
```

- `expireDate == null`이면 서버에서 `now + 1000 years`로 설정
    

### Response

- **200**: `addResult.getValue()` 반환
    

⚠️ **주의(코드 그대로 반영):**  
`Result<UUID>.getValue()`는 `Optional<UUID>`인데, 컨트롤러가 Optional을 그대로 반환하고 있어요.

즉 응답이 환경(Jackson Optional 모듈 설정)에 따라:

- `"550e..."` 같은 UUID 문자열로 내려올 수도 있고
    
- Optional 구조로 내려올 수도 있음
    

문서상 기대 값(의도):

```json
"550e8400-e29b-41d4-a716-446655440000"
```

### Error

- 실패 시 `ErrorResponse` + 해당 HTTP Status
    
    - 서비스 주석 기준: `403(어드민만)`, `404(userId/projectId)` 등
        

---

## 2.4 초대 코드로 프로젝트 조회

- **GET** `/api/v1/projects/invites/{inviteCode}`
    
- **Auth**: ✅ 필요 _(SecurityConfig 기준: 이 경로는 permitAll 아님)_
    

### Path Param

- `inviteCode`: UUID 문자열
    

### Response

- **200**: `ProjectResponse`
    

### Error

- **400**: UUID 파싱 실패 → Body 없음
    
- 서비스 실패 시 `ErrorResponse` + 상태코드
    
    - 서비스 주석 기준: `404 inviteCode`, `410 expired` 등
        

---

## 2.5 초대 코드로 프로젝트 참여

- **POST** `/api/v1/projects/invites/{inviteCode}`
    
- **Auth**: ✅ 필요
    

### Response

- **200** (Body 없음)
    

### Error

- **400**: UUID 파싱 실패 → Body 없음
    
- 실패 시 `ErrorResponse` + 상태코드
    

---

## 2.6 프로젝트 참여자 목록 조회

- **GET** `/api/v1/projects/{projectId}/participants`
    
- **Auth**: ✅ 필요 _(SecurityConfig 기준: permitAll 아님)_
    

### Response

- **200**: `UserResponse[]`
    

예시:

```json
[
  {
    "id": 10,
    "githubId": 999999,
    "githubLogin": "octocat",
    "name": "Octo Cat",
    "avatarUrl": "https://...",
    "createdAt": "2026-01-22T10:00:00",
    "lastLoginAt": "2026-01-22T10:05:00"
  }
]
```

---

## 2.7 채널(회의) 생성

- **POST** `/api/v1/projects/{projectId}/add-channel`
    
- **Auth**: ✅ 필요
    
- **Body**: `CreateMeetingRequest`
    

### Request Body

```json
{
  "title": "데일리 스탠드업",
  "mode": "VOICE"
}
```

### Response

- **200**: `result.getValue()` 반환
    

⚠️ **주의(코드 그대로 반영):**  
`Result<Long>.getValue()`는 `Optional<Long>`인데, 컨트롤러가 Optional을 그대로 반환하고 있어요.  
환경에 따라 `123`으로 내려올 수도, Optional 구조로 내려올 수도 있음.

문서상 기대 값(의도):

```json
123
```

### Error

- 실패 시 `ErrorResponse` + 해당 HTTP Status
    

---

## 2.8 프로젝트 채널(회의) 목록 조회

- **GET** `/api/v1/projects/{projectId}/channels`
    
- **Auth**: ✅ 필요 _(SecurityConfig 기준)_
    

### Query Params

- `status` (optional): `MeetingStatus` = `SCHEDULED | RUNNING | ENDED`
    
- `cursor` (optional처럼 보이지만 실제는 primitive long)
    
    - **주의:** `long cursor`라서 파라미터 생략 시 `0`이 들어갑니다.
        
- Pageable (Spring)
    
    - 기본 size: 20 (`@PageableDefault(size=20)`)
        
    - 일반적으로 `page`, `size`, `sort` 사용 가능  
        예: `?page=0&size=20&sort=createdAt,desc`
        

### Response

- **200**: `MeetingResponse[]`
    

예시(필드 구조):

```json
[
  {
    "id": 100,
    "project": { "id": 1, "name": "didit", "ownerId": 10, "repoId": 123456, "repoFullName": "org/repo", "thumbnailUrl": null, "createdAt": "2026-01-22T10:00:00", "updatedAt": "2026-01-22T10:10:00" },
    "createdBy": { "id": 10, "githubId": 999999, "githubLogin": "octocat", "name": "Octo Cat", "avatarUrl": "https://...", "createdAt": "2026-01-22T10:00:00", "lastLoginAt": "2026-01-22T10:05:00" },
    "sessionId": "OV_SESSION_abc",
    "title": "회의 제목",
    "status": "RUNNING",
    "mode": "VOICE",
    "startedAt": "2026-01-22T11:00:00",
    "endedAt": null,
    "createdAt": "2026-01-22T10:59:00",
    "updatedAt": "2026-01-22T11:01:00"
  }
]
```

---

# 3) Channels API (`/api/v1/channels`)

> MeetingController 기준 base path는 `/api/v1/channels/` 입니다.  
> 문서에서는 일반적으로 `/api/v1/channels/{channelId}` 형태로 표기.

## 3.1 채널(회의) 단건 조회

- **GET** `/api/v1/channels/{channelId}`
    
- **Auth**: ✅ 필요
    
- 내부에서:
    
    - `_meetingService.FindMeetingById(channelId)`
        
    - `_projectService.FindProjectUser(userId, projectId)` 로 멤버 검증
        

### Response

- **200**: `MeetingResponse`
    

---

## 3.2 채널(회의) 수정

- **PATCH** `/api/v1/channels/{channelId}`
    
- **Auth**: ✅ 필요
    
- **Query Params** (모두 optional)
    
    - `title`: string
        
    - `start`: `LocalDateTime` (ISO-8601 권장: `2026-01-22T11:00:00`)
        
    - `due`: `LocalDateTime`
        

> null이면 기존 값 유지(컨트롤러에서 기존 엔티티 값으로 대체)

### Response

- **200** (Body 없음)
    

### Error

- 실패 시 `ErrorResponse` + HTTP status
    
    - (회의 없음 / 멤버 아님 / 업데이트 실패 등)
        

---

## 3.3 채널(회의) 삭제

- **DELETE** `/api/v1/channels/{channelId}`
    
- **Auth**: ✅ 필요
    
- 내부에서:
    
    - 회의 조회 → 프로젝트 멤버 확인 → 삭제 수행
        

### Response

- **200** (Body 없음)
    

### Error

- 실패 시 `ErrorResponse` + HTTP status
    

---

# 4) 데이터 모델 (업로드 파일 기준)

## AddProjectRequest

```json
{
  "projectName": "string (max 64, not null)",
  "githubUrl": "string (url, not null)"
}
```

## AddProjectInviteRequest

```json
{
  "projectId": 1,
  "expireDate": "2026-02-01T00:00:00 | null"
}
```

## CreateMeetingRequest

```json
{
  "title": "string | null",
  "mode": "CHAT | VOICE"
}
```

## ProjectResponse

```json
{
  "id": 1,
  "name": "string",
  "ownerId": 10,
  "repoId": 123456,
  "repoFullName": "org/repo",
  "thumbnailUrl": "string | null",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

## UserResponse

```json
{
  "id": 10,
  "githubId": 999999,
  "githubLogin": "octocat",
  "name": "string | null",
  "avatarUrl": "string | null",
  "createdAt": "date-time",
  "lastLoginAt": "date-time"
}
```

## MeetingResponse

```json
{
  "id": 100,
  "project": "ProjectResponse",
  "createdBy": "UserResponse",
  "sessionId": "string",
  "title": "string | null",
  "status": "SCHEDULED | RUNNING | ENDED",
  "mode": "CHAT | VOICE",
  "startedAt": "date-time | null",
  "endedAt": "date-time | null",
  "createdAt": "date-time",
  "updatedAt": "date-time"
}
```

---

# 5) Enums

- `MeetingMode`: `CHAT`, `VOICE`
    
- `MeetingStatus`: `SCHEDULED`, `RUNNING`, `ENDED`
    
- `ProjectUserRole`: `ADMIN`, `MEMBER`
    
- `ProjectUserStatus`: `PENDING`, `ACTIVE`
    