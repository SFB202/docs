
## 공통

### 인증 방식

- **Spring Security 세션 기반** (`JSESSIONID` 쿠키)
    
- `SecurityConfig` 기준 PermitAll:
    
    - `/`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/login/**`, `/oauth2/**`
        
- 그 외 요청은 기본적으로 **인증 필요**
    

### 공통 에러 응답 (ErrorResponse)

- 실패 시 서비스 `Result`의 에러에서 `ErrorResponse`를 꺼내 그대로 반환
    
- JSON (Jackson 기준) 예시:
    

```json
{
  "statusCode": "NOT_FOUND",
  "message": "..."
}
```

### Result 래퍼 응답

- 일부 API는 `Result<T>` 자체를 반환함 (예: `/api/v1/user/me`)
    

```json
{
  "success": true,
  "value": { "...": "..." },
  "errors": []
}
```

---

## 1) Auth / User

|기능|Method|Path|Auth|Request|Response(200)|비고|
|---|--:|---|---|---|---|---|
|GitHub OAuth 로그인 시작|GET|`/api/v1/auth/login`|X|-|Redirect|`/oauth2/authorization/github`로 리다이렉트|
|로그아웃|POST|`/api/v1/auth/logout`|X|-|Redirect/200|세션 invalidate + `JSESSIONID` 삭제 + `/`로 리다이렉트 설정|
|내 세션 확인(테스트)|GET|`/api/v1/user/me`|O|-|`Result<Map<String,Object>>`|user null이면 401 fail throw|

---

## 2) Projects

### Request DTO

- **AddProjectRequest**
    
    - `projectName` (string, not null, max 64)
        
    - `githubUrl` (string, not null, URL)
        
- **AddProjectInviteRequest**
    
    - `projectId` (long, not null)
        
    - `expireDate` (LocalDateTime, optional) — null이면 `now + 1000y`로 처리
        
- **CreateMeetingRequest**
    
    - `title` (string, not null, max 50)
        
    - `mode` (MeetingMode, not null) : `CHAT | VOICE`
        

### Response DTO

- **ProjectResponse**
    
    - `id, name, ownerId, repoId, repoFullName, thumbnailUrl, createdAt, updatedAt`
        

|기능|Method|Path|Auth|Request|Response(200)|비고|
|---|--:|---|---|---|---|---|
|내 프로젝트 목록 조회|GET|`/api/v1/projects`|O|-|`List<ProjectResponse>`|`ProjectService.findProjectsByUserId`|
|프로젝트 생성|POST|`/api/v1/projects`|O|`AddProjectRequest` (JSON)|Empty Body|성공 시 `200 OK`만 반환|
|프로젝트 참여자 목록|GET|`/api/v1/projects/{projectId}/participants`|X|-|`List<UserResponse>`|코드상 인증 체크 없음(열려있음)|

---

## 3) Invites (프로젝트 초대)

|기능|Method|Path|Auth|Request|Response(200)|비고|
|---|--:|---|---|---|---|---|
|초대코드 생성|POST|`/api/v1/projects/invites`|O|`AddProjectInviteRequest` (JSON)|`UUID`|`expireDate` 없으면 +1000년|
|초대코드로 프로젝트 조회|GET|`/api/v1/projects/invites/{inviteCode}`|X|-|`ProjectResponse`|`inviteCode` UUID 파싱 실패 시 `400 BadRequest`(바디 없음)|
|초대코드로 프로젝트 참여|POST|`/api/v1/projects/invites/{inviteCode}`|O|-|Empty Body|`inviteCode` UUID 파싱 실패 시 `400 BadRequest`|

---

## 4) Channels (Meeting) 단건 조작

> 컨트롤러 경로: `@RequestMapping("/api/v1/channels/")`  
> 아래 표에서는 일반적인 형태로 `/api/v1/channels/{channelId}`로 표기

### Response DTO

- **MeetingResponse**
    
    - `id, project(ProjectResponse), createdBy(UserResponse), sessionId, title, status, mode, startedAt, endedAt, createdAt, updatedAt`
        

|기능|Method|Path|Auth|Request|Response(200)|비고|
|---|--:|---|---|---|---|---|
|채널(회의) 단건 조회|GET|`/api/v1/channels/{channelId}`|O|-|`MeetingResponse`|프로젝트 멤버 여부 확인(`FindProjectUser`)|
|채널(회의) 수정|PATCH|`/api/v1/channels/{channelId}`|O|QueryParam: `title?`, `start?`, `due?`|Empty Body|null이면 기존 값 유지. 날짜는 `LocalDateTime`(ISO-8601) 기대|
|채널(회의) 삭제|DELETE|`/api/v1/channels/{channelId}`|O|-|Empty Body|프로젝트 멤버 여부 확인 후 삭제|

---

## 5) Project 하위 채널(회의) 생성/목록

|기능|Method|Path|Auth|Request|Response(200)|비고|
|---|--:|---|---|---|---|---|
|채널(회의) 생성|POST|`/api/v1/projects/{projectId}/add-channel`|O|`CreateMeetingRequest` (JSON)|`Long`|생성된 meeting PK 반환|
|채널(회의) 목록 조회|GET|`/api/v1/projects/{projectId}/channels`|X|Query: `status?`, `cursor?`, Pageable|`List<MeetingResponse>`|`@PageableDefault(size=20)` 사용. `cursor`는 서비스는 `long`이라 null이면 NPE 가능(실사용시 0 권장)|

---