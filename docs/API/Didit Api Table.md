# Didit Api Table (2026 - 02 - 02)

---

## 공통 규칙 요약

|항목|내용|
|---|---|
|인증 방식|Spring Security OAuth2(GitHub) + 세션 쿠키 `JSESSIONID`|
|기본 인증 필요|대부분 **인증 필요**|
|인증 예외 경로|`/`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/login/**`, `/oauth2/**`, `/error`|
|Body|JSON (별도 표기 없으면)|
|Timestamp|ISO-8601 `LocalDateTime` (예: `2026-01-26T14:30:00`)|
|Pagination|`page`, `size`, `sort` (Spring `Pageable`)|
|Cursor|일부 엔드포인트에서 `lastId` / `cursor` 사용|

---

## Enums

|Enum|값|
|---|---|
|MeetingMode|`CHAT`, `VOICE`|
|MeetingStatus|`SCHEDULED`, `RUNNING`, `ENDED`|
|IssueStatus|`OPEN`, `CLOSED`|
|IssuePriority|`HIGH`, `MEDIUM`, `LOW`|
|MessageType|`TEXT`, `SYSTEM`|

---

## 에러 응답

|항목|내용|
|---|---|
|바디|`{ "statusCode": "...", "message": "..." }`|
|HTTP Status|`statusCode`에 맞춰 동일하게 설정|

---

## Response 스키마(참고)

|이름|요약|
|---|---|
|ProjectResponse|프로젝트 정보|
|UserResponse|사용자 정보|
|MeetingResponse|미팅(채널) 상세(프로젝트/생성자 포함)|
|IssueResponse|이슈 상세(프로젝트/작성자/상태/우선순위/담당자 등)|
|ProjectRecentResponse|최근 조회 프로젝트(유저 + 프로젝트 + lastViewedAt)|
|ChatResponse|채팅 메시지(작성자/타입/메시지/createdAt/editedAt)|

---

# Endpoints 표 정리

## 1) Auth

|Method|Path|설명|Request|Response (200/성공)|비고|
|---|---|---|---|---|---|
|GET|`/auth/login`|GitHub OAuth 로그인 플로우로 리다이렉트|-|`302` (Location: `/oauth2/authorization/github`)|인증 예외|
|POST|`/auth/logout`|로그아웃(세션 무효화 + `JSESSIONID` 제거)|-|`302` -> `/`|인증 예외|
|GET|`/auth/me`|현재 로그인 사용자 반환|-|`200` -> `UserResponse`|인증 필요|

---

## 2) Projects

|Method|Path|설명|Request Body|Response (200/성공)|비고|
|---|---|---|---|---|---|
|GET|`/projects`|내 프로젝트 목록|-|`ProjectResponse[]`|인증 필요|
|POST|`/projects`|프로젝트 생성 + 생성자를 ADMIN 등록|`{ projectName, githubUrl }`|빈 바디|`projectName<=64`, `githubUrl` URL 검증|
|GET|`/projects/{projectId}`|프로젝트 상세 + 최근 조회 갱신|-|`ProjectResponse`|인증 필요|
|GET|`/projects/recents`|최근 조회 프로젝트 최대 4개|-|`ProjectRecentResponse[]`|인증 필요|
|GET|`/projects/{projectId}/participants`|프로젝트 참여자 목록|-|`UserResponse[]`|인증 필요|

---

## 3) Invites

|Method|Path|설명|Request Body|Response (200/성공)|에러/비고|
|---|---|---|---|---|---|
|POST|`/projects/invites`|프로젝트 초대코드 생성(ADMIN only)|`{ projectId, expireDate? }`|UUID 문자열|`expireDate` 없으면 매우 먼 미래로 설정|
|GET|`/projects/invites/{inviteCode}`|초대코드로 프로젝트 조회|-|`ProjectResponse`|`inviteCode` UUID 아니면 `400`|
|POST|`/projects/invites/{inviteCode}`|초대코드로 프로젝트 참여|-|빈 바디|`inviteCode` UUID 아니면 `400`|

---

## 4) Meetings (Channels)

### 4-1) 생성/예약/조회

|Method|Path|설명|Request Body / Query|Response (200/성공)|비고|
|---|---|---|---|---|---|
|POST|`/projects/{projectId}/add-channel`|채널(미팅) 생성|`{ title, mode }`|생성된 meetingId (number)|-|
|POST|`/projects/{projectId}/book-channel`|채널 예약|`{ title, start, end }`|생성된 meetingId (number)|`title<=50`, `start/end` 미래, `start > end` 거부, 현재 구현은 `status=SCHEDULED`, `mode=VOICE`로 저장|
|GET|`/projects/{projectId}/channels`|프로젝트 채널 목록|Query: `status?`, `cursor(권장)`, `page/size/sort`|`MeetingResponse[]`|`id` desc, 첫 페이지 cursor=0 권장|
|GET|`/projects/{projectId}/channels/date`|시간 범위 내 채널 목록|Query(필수): `start`, `end`|`MeetingResponse[]`|`id` desc|
|GET|`/channels/{channelId}`|채널 상세|-|`MeetingResponse`|-|
|PATCH|`/channels/{channelId}`|채널 제목/시간 수정|Query(optional): `title`, `start`, `due`|빈 바디|-|
|DELETE|`/channels/{channelId}`|채널 삭제|-|빈 바디|-|

### 4-2) WebRTC (VOICE 전용)

|Method|Path|설명|Request|Response (200/성공)|에러|
|---|---|---|---|---|---|
|POST|`/channels/{channelId}/webrtc`|VOICE 채널 참여(미디어 커넥션 생성 + joined 처리)|-|토큰(string)|모드가 VOICE 아니면 `409`|
|DELETE|`/channels/{channelId}/webrtc`|VOICE 채널 나가기(커넥션 종료 + left 처리)|-|빈 바디|모드가 VOICE 아니면 `409`|
|GET|`/channels/{channelId}/webrtc/users`|VOICE 채널 접속 사용자 목록|-|`UserResponse[]`|모드가 VOICE 아니면 `409`|

---

## 5) Chat Messages

|Method|Path|설명|Request Body / Query|Response (200/성공)|비고|
|---|---|---|---|---|---|
|POST|`/channels/{channelId}/chats`|채팅 전송|`{ content }`|빈 바디|-|
|GET|`/channels/{channelId}/chats`|채팅 목록 조회|Query: `lastId?`, `page/size/sort`|`ChatResponse[]`|`id` asc|
|PATCH|`/channels/chats/{chatId}`|채팅 수정(작성자만)|`{ content }`|빈 바디|권한 필요|
|DELETE|`/channels/chats/{chatId}`|채팅 삭제(작성자만)|-|빈 바디|권한 필요|

---

## 6) SSE (실시간 이벤트 스트림)

|Method|Path|설명|Response|권한/비고|
|---|---|---|---|---|
|GET|`/channels/{channelId}/stream`|채널 실시간 이벤트 구독|`200` + `text/event-stream`|프로젝트 멤버 아니면 `403`|

### SSE 동작/이벤트 요약

|항목|내용|
|---|---|
|Timeout|30분 (클라이언트 재연결 필요)|
|Keep-alive|20초마다 `ping` 이벤트|
|이벤트 타입|`message`, `chat_update`, `chat_delete`, `ping`|
|주의|`message`는 채널 id로 브로드캐스트, `chat_update/chat_delete`는 현재 `projectId`로 브로드캐스트(클라이언트는 부모 프로젝트 채널도 구독 필요)|

---

## 7) Issues

|Method|Path|설명|Request|Response (200/성공)|비고|
|---|---|---|---|---|---|
|GET|`/projects/{projectId}/issues/active`|OPEN 이슈 최대 5개, `updatedAt desc`|-|`IssueResponse[]`|-|
