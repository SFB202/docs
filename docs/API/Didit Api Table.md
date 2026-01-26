# Didit Api V2026-01-26 Table
아래는 **Didit Server API (v1)** 를 “표로” 정리한 버전이야. (Base path: `/api/v1`)

---

## 1) 인증/접근 규칙 요약

|항목|내용|
|---|---|
|인증 방식|Spring Security OAuth2 (GitHub) + 세션 쿠키 `JSESSIONID`|
|기본 정책|**대부분의 엔드포인트는 인증 필요**|
|인증 예외(비인증 허용)|`/`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/login/**`, `/oauth2/**`|

---

## 2) 공통 규칙(Conventions)

|항목|내용|
|---|---|
|Body 포맷|JSON (별도 표기 없으면)|
|Timestamp|ISO-8601 `LocalDateTime` (예: `2026-01-26T14:30:00`)|
|Enum|`MeetingMode`: CHAT/VOICE, `MeetingStatus`: SCHEDULED/RUNNING/ENDED, `IssueStatus`: OPEN/CLOSED, `IssuePriority`: HIGH/MEDIUM/LOW|
|ErrorResponse|`{"statusCode":"NOT_FOUND","message":"..."}` + HTTP status도 동일하게 설정|

---

## 3) 응답 스키마 요약

### ProjectResponse

|필드|타입/형식|비고|
|---|---|---|
|id|number|프로젝트 ID|
|name|string|프로젝트명|
|ownerId|number|소유자(생성자) ID|
|repoId|number|GitHub repo id|
|repoFullName|string|`org/repo`|
|thumbnailUrl|string(URL)|썸네일|
|createdAt|string(datetime)|ISO-8601|
|updatedAt|string(datetime)|ISO-8601|

### UserResponse

|필드|타입/형식|비고|
|---|---|---|
|id|number|내부 사용자 ID|
|githubId|number|GitHub user id|
|githubLogin|string|GitHub login|
|name|string|표시 이름|
|avatarUrl|string(URL)|아바타|
|createdAt|string(datetime)|ISO-8601|
|lastLoginAt|string(datetime)|ISO-8601|

### MeetingResponse

|필드|타입/형식|비고|
|---|---|---|
|id|number|회의 ID|
|project|ProjectResponse(축약)|프로젝트 정보|
|createdBy|UserResponse(축약)|생성자|
|sessionId|string(UUID)|세션 UUID|
|title|string|제목|
|status|enum|SCHEDULED/RUNNING/ENDED|
|mode|enum|CHAT/VOICE|
|startedAt|string(datetime)|시작|
|endedAt|string(datetime)|종료|
|createdAt|string(datetime)|생성|
|updatedAt|string(datetime)|수정|

### IssueResponse

|필드|타입/형식|비고|
|---|---|---|
|id|number|이슈 ID|
|project|ProjectResponse(축약)|프로젝트|
|githubIssueId|number|GitHub issue id|
|issueNo|number|GitHub issue number|
|title|string|제목|
|body|string|본문|
|status|enum|OPEN/CLOSED|
|priority|enum|HIGH/MEDIUM/LOW|
|author|UserResponse(축약)|작성자|
|createdAt|string(datetime)|생성|
|updatedAt|string(datetime)|수정|
|closedAt|string(datetime)\|null|닫힘 시간|
|assignees|array|할당자 목록|

### ProjectRecentResponse

|필드|타입/형식|비고|
|---|---|---|
|id|number|recent row id|
|user|UserResponse(축약)|사용자|
|project|ProjectResponse(축약)|프로젝트|
|lastViewedAt|string(datetime)|마지막 조회|

---

## 4) 엔드포인트 전체 표

### Auth

|Method|Path|설명|Request|Query|Response(성공)|비고/에러|
|---|---|---|---|---|---|---|
|GET|`/auth/login`|GitHub OAuth 로그인 플로우로 리다이렉트|-|-|`302` (Location: `/oauth2/authorization/github`)|비인증 허용|
|POST|`/auth/logout`|로그아웃(세션 무효화 + JSESSIONID 제거)|-|-|`302` → `/`|비인증 허용(현재 설정)|

### User

|Method|Path|설명|Request|Query|Response(성공)|비고/에러|
|---|---|---|---|---|---|---|
|GET|`/user/me`|현재 로그인 사용자 OAuth2 속성 반환|-|-|`200` -> `{ value, success, errors }`|인증 필요|

### Projects

|Method|Path|설명|Request|Query|Response(성공)|비고/검증|
|---|---|---|---|---|---|---|
|GET|`/projects`|내 프로젝트 목록|-|-|`200` -> `ProjectResponse[]`|인증 필요|
|POST|`/projects`|프로젝트 생성 + 생성자 ADMIN 등록|`{projectName, githubUrl}`|-|`200` (빈 바디)|`projectName<=64`, `githubUrl` URL|
|GET|`/projects/{projectId}`|프로젝트 상세 + recent 조회 갱신|-|-|`200` -> `ProjectResponse`|인증 필요|
|GET|`/projects/recents`|최근 본 프로젝트 최대 4개|-|-|`200` -> `ProjectRecentResponse[]`|인증 필요|
|GET|`/projects/{projectId}/participants`|참여자 목록|-|-|`200` -> `UserResponse[]`|인증 필요|

### Invites

|Method|Path|설명|Request|Query|Response(성공)|비고/에러|
|---|---|---|---|---|---|---|
|POST|`/projects/invites`|초대코드 생성(관리자)|`{projectId, expireDate?}`|-|`200` -> `"UUID"`|expireDate 생략 시 “매우 먼 미래” 설정|
|GET|`/projects/invites/{inviteCode}`|초대코드로 프로젝트 조회|-|-|`200` -> `ProjectResponse`|`inviteCode` UUID 아니면 `400`|
|POST|`/projects/invites/{inviteCode}`|초대코드로 프로젝트 참가|-|-|`200` (빈 바디)|`inviteCode` UUID 아니면 `400`|

### Meetings (Channels)

|Method|Path|설명|Request|Query|Response(성공)|비고/검증|
|---|---|---|---|---|---|---|
|POST|`/projects/{projectId}/add-channel`|회의(채널) 생성|`{title, mode}`|-|`200` -> `number`(meetingId)|mode: CHAT/VOICE|
|POST|`/projects/{projectId}/book-channel`|회의(채널) 예약 생성|`{title, start, end}`|-|`200` -> `number`(meetingId)|`title<=50`, `start/end` 미래, start<=end, status=SCHEDULED(현재), mode=VOICE(현재)|
|GET|`/projects/{projectId}/channels`|회의 목록(커서/페이지)|-|`status?`, `cursor?`, `page/size/sort`|`200` -> `MeetingResponse[]`|`id` desc 정렬|
|GET|`/projects/{projectId}/channels/date`|기간 내 회의 목록|-|`start`(필수), `end`(필수)|`200` -> `MeetingResponse[]`|`id` desc 정렬|
|GET|`/channels/{channelId}`|회의 상세|-|-|`200` -> `MeetingResponse`||
|PATCH|`/channels/{channelId}`|회의 제목/시간 수정|-|`title?`, `start?`, `due?`|`200` (빈 바디)|파라미터 전부 optional|
|DELETE|`/channels/{channelId}`|회의 삭제|-|-|`200` (빈 바디)||

### Issues

|Method|Path|설명|Request|Query|Response(성공)|비고|
|---|---|---|---|---|---|---|
|GET|`/projects/{projectId}/issues/active`|활성(OPEN) 이슈 최대 5개|-|-|`200` -> `IssueResponse[]`|`updatedAt` desc|
