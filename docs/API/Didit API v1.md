
## 목차

- 공통 규칙
    
- Auth
    
- Projects
    
- Meetings
    
- 데이터 모델 (DTO)
    
- Enums
    

---

## 공통 규칙

### Base URL

- `/{...}` (상대 경로 기준)
    
- API Prefix: 보통 `/api/v1`
    

### 인증 (Session Cookie)

- 로그인 후 서버가 발급한 **세션 쿠키**를 사용
    
- 쿠키 이름: `JSESSIONID` (프로젝트 문서 기준)
    

예시:

```bash
-H "Cookie: JSESSIONID=<session-id>"
```

### Content-Type

- 요청 Body가 있는 경우:
    
    - `Content-Type: application/json`
        

### 에러 응답: `ErrorResponse`

`ProjectController`의 대부분 API는 실패 시 아래 형태로 내려옴.

```json
{
  "statusCode": "NOT_FOUND",
  "message": "..."
}
```

> `ErrorResponse.java`의 필드는 `StatusCode`, `Message`지만, Jackson 직렬화 시 보통 `statusCode`, `message`로 내려가는 형태가 일반적이야.

### Result 래퍼: `Result<T>` (Meeting API에서 사용)

`MeetingController`는 성공/실패를 **HTTP Status로 나누지 않고**, **항상 200 + Result 객체**를 반환함.

```json
{
  "value": 123,
  "success": true,
  "errors": []
}
```

실패 예시:

```json
{
  "value": null,
  "success": false,
  "errors": [
    { "code": 404, "message": "projectId not found" }
  ]
}
```

> `ResultError`의 정확한 필드는 업로드에 포함되지 않았지만, `Result.fail(int code, String message)`가 `SimpleError(code, message)`를 사용하므로 일반적으로 `code/message` 형태를 기대할 수 있어.

---

# Auth

## 1) GitHub OAuth 로그인 시작

- **GET** `/api/v1/auth/login`
    
- 설명: 서버가 `/oauth2/authorization/github`로 **리다이렉트**
    

### Response

- **302 Redirect**
    
- `Location: /oauth2/authorization/github`
    

```bash
curl -i -X GET /api/v1/auth/login
```

---

# Projects

> 컨트롤러 Prefix: `/api/v1/projects`

## 1) 내 프로젝트 목록 조회

- **GET** `/api/v1/projects`
    
- Auth: **필요** (`@AuthenticationPrincipal CustomOAuth2User`)
    
- Response: `FindProjectResponse[]`
    

### Response

- **200**
    

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

- **404**: userId not found
    

```json
{ "statusCode": "NOT_FOUND", "message": "..." }
```

### cURL

```bash
curl -X GET /api/v1/projects \
  -H "Cookie: JSESSIONID=<session-id>"
```

---

## 2) 프로젝트 생성

- **POST** `/api/v1/projects`
    
- Auth: **필요**
    
- Body: `AddProjectRequest`
    

### Request Body

```json
{
  "projectName": "didit",
  "githubUrl": "https://github.com/org/repo"
}
```

- 유효성(코드 기준)
    
    - `projectName`: NotNull, max 64
        
    - `githubUrl`: NotNull, URL 형식
        

### Response

- **200** (본문 없음)
    
- **400** validation fail → `ErrorResponse`
    
- **404** userId not found → `ErrorResponse`
    
- **407** repoFullName 중복 등 → `ErrorResponse`
    
    > (서비스 주석에 407로 명시)
    

### cURL

```bash
curl -X POST /api/v1/projects \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -d '{"projectName":"didit","githubUrl":"https://github.com/org/repo"}'
```

---

## 3) 프로젝트 초대코드 생성

- **POST** `/api/v1/projects/invites`
    
- Auth: **필요**
    
- Body: `AddProjectInviteRequest`
    

### Request Body

```json
{
  "projectId": 1,
  "expireDate": "2026-02-01T00:00:00"
}
```

- `expireDate`가 `null`이면 서버에서:
    
    - `now + 1000 years` 로 자동 설정
        

### Response

- **200**: 초대 코드(UUID)
    

> 구현상 `addResult.getValue()`(Optional)를 그대로 반환하지만, 일반적인 Spring Boot Jackson 설정에서는 UUID 문자열로 직렬화되는 케이스가 많음.

예시:

```json
"550e8400-e29b-41d4-a716-446655440000"
```

- **403**: admin 권한 없음 → `ErrorResponse`
    
- **404**: userId / projectId not found → `ErrorResponse`
    

### cURL

```bash
curl -X POST /api/v1/projects/invites \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -d '{"projectId":1,"expireDate":null}'
```

---

## 4) 초대코드로 프로젝트 조회

- **GET** `/api/v1/projects/invites/{inviteCode}`
    
- Auth: **불필요**
    
- Path Param:
    
    - `inviteCode`: UUID string
        

### Response

- **200**: `FindProjectResponse`
    
- **400**: inviteCode UUID 파싱 실패 → **본문 없음**
    
- **404**: inviteCode not found → `ErrorResponse`
    
- **410**: inviteCode expired → `ErrorResponse`
    

### cURL

```bash
curl -X GET /api/v1/projects/invites/550e8400-e29b-41d4-a716-446655440000
```

---

## 5) 초대코드로 프로젝트 참여

- **POST** `/api/v1/projects/invites/{inviteCode}`
    
- Auth: **필요**
    
- Path Param:
    
    - `inviteCode`: UUID string
        

### Response

- **200** (본문 없음)
    
- **400**: inviteCode UUID 파싱 실패 → **본문 없음**
    
- **404**: inviteCode/userId/projectId not found → `ErrorResponse`
    
- **410**: inviteCode expired → `ErrorResponse`
    

### cURL

```bash
curl -X POST /api/v1/projects/invites/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: JSESSIONID=<session-id>"
```

---

## 6) 프로젝트 참여자 목록 조회

- **GET** `/api/v1/projects/{projectId}/participants`
    
- Auth: 코드상 AuthenticationPrincipal은 없어서 **불필요**(현재 구현 기준)
    
- Path Param:
    
    - `projectId`: long
        

### Response

- **200**: `UserResponse[]`
    

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

- **404**: projectId not found → `ErrorResponse`
    

### cURL

```bash
curl -X GET /api/v1/projects/1/participants
```

---

# Meetings

> 컨트롤러 Prefix: `/api/v1/rooms`

## 1) 회의실(Session) 생성

- **POST** `/api/v1/rooms/{id}/sessions`
    
- Auth: **필요**
    
- Path Param:
    
    - `id`: long (**MeetingService 기준 projectId**)
        
- Body: `CreateMeetingRequest`
    

### Request Body

```json
{
  "title": "데일리 스탠드업",
  "mode": "VOICE"
}
```

- `mode`: `MeetingMode` enum (`CHAT`, `VOICE`)
    

### Response (중요)

- **항상 200**
    
- Body는 `Result<Long>`
    

성공 예시:

```json
{
  "value": 123,
  "success": true,
  "errors": []
}
```

실패 예시(서비스 주석 기준):

```json
{
  "value": null,
  "success": false,
  "errors": [
    { "code": 403, "message": "forbidden" }
  ]
}
```

> MeetingService 주석에 명시된 실패 케이스:

- 404: projectId 없음
    
- 403: 프로젝트 멤버가 아님
    
- 400: title 누락 또는 50자 초과
    
- 500: 저장 중 런타임 예외
    

### cURL

```bash
curl -X POST /api/v1/rooms/1/sessions \
  -H "Content-Type: application/json" \
  -H "Cookie: JSESSIONID=<session-id>" \
  -d '{"title":"데일리","mode":"VOICE"}'
```

---

# 데이터 모델 (DTO)

## AddProjectRequest

```json
{
  "projectName": "string (max 64)",
  "githubUrl": "string (url)"
}
```

## AddProjectInviteRequest

```json
{
  "projectId": 1,
  "expireDate": "date-time | null"
}
```

## CreateMeetingRequest

```json
{
  "title": "string | null",
  "mode": "CHAT | VOICE"
}
```

## FindProjectResponse

```json
{
  "id": 1,
  "name": "string",
  "ownerId": 10,
  "repoId": 123,
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

## ErrorResponse

```json
{
  "statusCode": "HTTP_STATUS_NAME",
  "message": "string"
}
```

## Result

```json
{
  "value": "T | null",
  "success": true,
  "errors": ["ResultError[]"]
}
```

---

# Enums

## MeetingMode

- `CHAT`
    
- `VOICE`
    

## MeetingStatus

- `SCHEDULED`
    
- `RUNNING`
    
- `ENDED`
    

## ProjectUserRole

- `ADMIN`
    
- `MEMBER`
    

## ProjectUserStatus

- `PENDING`
    
- `ACTIVE`
    

---

원하면 이 마크다운을 **MkDocs Material** 네비에 바로 붙이기 좋게:

- `docs/API/api.md` 형태로 파일 구조 맞추고
    
- 각 엔드포인트를 “표 형태(요청/응답/에러코드)”로 더 깔끔하게 정리한 버전도 만들어줄게.