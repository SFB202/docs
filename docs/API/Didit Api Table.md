# Didit Api V3 Table
## 1) 기본 정보 / 규칙

|항목|내용|
|---|---|
|Base path|`/api/v1`|
|Port|`8080`|
|Auth|OAuth2(GitHub) + Session Cookie(`JSESSIONID`)|
|Public(인증 예외)|`/`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/login/**`, `/oauth2/**`|
|Body|JSON (별도 표기 없으면)|
|Timestamp|ISO-8601 `LocalDateTime``2026-01-26T14:30:00`|
|Enums|`MeetingMode: CHAT/VOICE``MeetingStatus: SCHEDULED/RUNNING/ENDED``IssueStatus: OPEN/CLOSED``IssuePriority: HIGH/MEDIUM/LOW`|

---

## 2) 공통 에러 응답

|타입|HTTP Status|Body|
|---|---|---|
|ErrorResponse|상태코드에 맞게 설정|`{"statusCode":"NOT_FOUND","message":"..."}`|

---

## 3) Response 스키마 요약

|스키마|포함(요약)|
|---|---|
|ProjectResponse|`id, name, ownerId, repoId, repoFullName, thumbnailUrl``createdAt, updatedAt`|
|UserResponse|`id, githubId, githubLogin, name, avatarUrl``createdAt, lastLoginAt`|
|MeetingResponse|`id, project(ProjectResponse), createdBy(UserResponse)``sessionId, title, status, mode``startedAt, endedAt, createdAt, updatedAt`|
|IssueResponse|`id, project(ProjectResponse), githubIssueId, issueNo``title, body, status, priority``author(UserResponse), createdAt, updatedAt, closedAt``assignees[]`|
|ProjectRecentResponse|`id, user(UserResponse), project(ProjectResponse)``lastViewedAt`|

---

## 4) Endpoints (MkDocs 최적화 표)

> 표 폭을 줄이기 위해 **Request/Query/Response는 요약**했고, 긴 내용은 `<br>`로 줄바꿈했어.

|영역|Method|Path|설명|Request / Query|Success|Notes / Errors|
|---|---|---|---|---|---|---|
|Auth|GET|`/auth/login`|GitHub OAuth로 리다이렉트|-|`302``Location: /oauth2/authorization/github`||
|Auth|POST|`/auth/logout`|로그아웃(세션 무효화 + 쿠키 삭제)|-|`302` → `/`|(현재 설정)|
|User|GET|`/user/me`|현재 인증 사용자 OAuth2 속성 반환|-|`200``Result<{id,login}>`|`{"value":...,"success":true,"errors":[]}`|
|Projects|GET|`/projects`|내 프로젝트 목록|-|`200``ProjectResponse[]`||
|Projects|POST|`/projects`|프로젝트 생성 + 생성자 ADMIN|Body: `{projectName, githubUrl}`|`200` (빈 바디)|`projectName<=64``githubUrl` URL 검증|
|Projects|GET|`/projects/{projectId}`|프로젝트 상세 + 최근조회 업데이트|-|`200``ProjectResponse`||
|Projects|GET|`/projects/recents`|최근 조회 최대 4개|-|`200``ProjectRecentResponse[]`||
|Projects|GET|`/projects/{projectId}/participants`|참여자 목록|-|`200``UserResponse[]`||
|Invites|POST|`/projects/invites`|초대코드 생성(ADMIN)|Body: `{projectId, expireDate?}`|`200``"uuid-string"`|`expireDate` 생략 시 먼 미래로 설정|
|Invites|GET|`/projects/invites/{inviteCode}`|초대코드로 프로젝트 조회|Path: `{inviteCode}`|`200``ProjectResponse`|UUID 아니면 `400`|
|Invites|POST|`/projects/invites/{inviteCode}`|초대코드로 참여|Path: `{inviteCode}`|`200` (빈 바디)|UUID 아니면 `400`|
|Meetings|POST|`/projects/{projectId}/add-channel`|회의(채널) 생성|Body: `{title, mode}`|`200``meetingId(number)`||
|Meetings|GET|`/projects/{projectId}/channels`|회의(채널) 목록|Query:`status?` `cursor?``page/size/sort`|`200``MeetingResponse[]`|`id DESC``cursor` 첫 페이지 `0``size` 기본 `20`|
|Meetings|GET|`/channels/{channelId}`|회의 상세|-|`200``MeetingResponse`||
|Meetings|PATCH|`/channels/{channelId}`|제목/시간 수정|Query(옵션):`title?` `start?` `due?`|`200` (빈 바디)||
|Meetings|DELETE|`/channels/{channelId}`|회의 삭제|-|`200` (빈 바디)||
|Issues|GET|`/projects/{projectId}/issues/active`|활성(OPEN) 이슈 최대 5개|-|`200``IssueResponse[]`|`updatedAt DESC`|
