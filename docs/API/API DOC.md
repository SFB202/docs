
## 공통 규칙(권장)

- **Error 응답(공통 예시)**: `400/401/403/404/409/500` + `{ "message": "...", "code": "..." }`
    
- **리스트 페이지네이션(권장)**: `?cursor=...&size=20` 또는 `?page=0&size=20`
    
- **시간 포맷(권장)**: ISO-8601 (`2026-01-16T10:30:00+09:00`)
    

---

## 로그인/로그아웃

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|로그인 (GitHub OAuth 시작)|GET|`/api/v1/auth/login`|(없음)|**302 Redirect** → GitHub OAuth URL|||MUST|
|로그아웃|POST|`/api/v1/auth/logout`|(없음)|`200 OK``{ "ok": true }`|||MUST|

> (권장) OAuth 콜백 엔드포인트는 보통 `/api/v1/auth/callback` 같은 형태로 추가됨 (표엔 없어서 생략)

---

## 유저/마이페이지

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|내 방 목록 확인(사이드바/마이페이지 공용)|GET|`/api/v1/rooms`|Query(선택): `?cursor&size`|`200 OK``[{ "roomId": 1, "name": "A", "thumbnailUrl": "...", "unread": true, "role": "ADMIN" }]`|||MUST|
|내 프로필 조회(권장 추가)|GET|`/api/v1/users/me`|(없음)|`200 OK``{ "userId": 7, "githubLogin": "abc", "name": "홍길동", "avatarUrl": "..." }`|||MUST|
|프로필 사진 수정|PATCH|`/api/v1/users/me`|`{"avatarUrl":"https://..."}` 또는 `multipart/form-data`|`200 OK``{ "userId": 7, "avatarUrl": "..." }`|||SHOULD|
|활동 기록(최근 회의/이슈)(권장 추가)|GET|`/api/v1/users/me/activity`|Query(선택): `?limit=10`|`200 OK``{ "recentMeetings":[...], "recentIssues":[...] }`|||SHOULD|

---

## 라운지/방 내부(대시보드/리스트)

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|회의록(회의) 리스트 불러오기|GET|`/api/v1/rooms/{id}/meetings`|Query(선택): `?status=UPCOMING|RUNNING|DONE|CANCELED&cursor&size`|`200 OK``[{ "meetingId": 1, "title": "...", "status":"DONE", "startAt":"...", "endAt":"...", "participantsCount":3 }]`|
|최근 회의록 3개 불러오기|GET|`/api/v1/rooms/{id}/meetings/recent`|(없음)|`200 OK``[{ "meetingId": 3, "title":"...", "endedAt":"..." }]`|||MUST|
|전체 회의록 검색|GET|`/api/v1/rooms/{id}/meetings/search`|Query: `?q=키워드&cursor&size`|`200 OK``[{ "meetingId": 1, "title":"...", "highlight":"..." }]`|||MUST|
|참여자 목록 불러오기|GET|`/api/v1/rooms/{id}/participants`|(없음)|`200 OK``[{ "userId":7, "name":"...", "avatarUrl":"...", "role":"MEMBER" }]`|||MUST|
|진행중인 이슈 5개 불러오기|GET|`/api/v1/rooms/{id}/issues/active`|(없음)|`200 OK``[{ "issueNumber":12, "title":"...", "createdBy":"abc", "createdAt":"..." }]`|||MUST|
|방 탈퇴|DELETE|`/api/v1/rooms/{id}/leave`|(없음)|`200 OK``{ "ok": true }`|||MUST|
|(권장) 주간 활동 요약(통계)|GET|`/api/v1/rooms/{id}/stats/weekly`|Query(선택): `?week=2026-W03`|`200 OK``{ "issuesCreated":3, "issuesClosed":1, "meetingMinutes":120 }`|||MUST|

---

## 회의실(세션/미팅 룸 엔티티 관리)

> 너 표에서 `/sessions`는 “회의실 인스턴스(세션)” 관리로 보이니, 아래처럼 잡으면 깔끔함.

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|회의실 생성|POST|`/api/v1/rooms/{id}/sessions`|`{"title":"회의 제목", "scheduledAt":"2026-01-16T14:00:00+09:00" (선택)}`|`201 Created``{ "sessionId": 10, "meetingId": 3, "title":"...", "status":"RUNNING" }`|||MUST|
|회의실 삭제|DELETE|`/api/v1/rooms/{id}/sessions/{sId}`|(없음)|`200 OK`|||MUST|
|회의실 이름 수정|PATCH|`/api/v1/rooms/{id}/sessions/{sId}`|`{"title":"새 제목"}`|`200 OK``{ "sessionId":10, "title":"새 제목" }`|||SHOULD|
|회의실 나가기|DELETE|`/api/v1/meetings/{mId}/leave`|(없음)|`200 OK``{ "ok": true }`|||MUST|

---

## 캘린더(회의 예약)

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|캘린더 생성(회의 예약 생성)|POST|`/api/v1/rooms/{id}/calendar`|`{"title":"...", "startAt":"...", "endAt":"...", "participantIds":[7,8]}`|`201 Created``{ "calendarId": 21, "meetingId": 5, "status":"UPCOMING" }`|||MUST|
|캘린더 수정|PATCH|`/api/v1/calendar/{cId}`|`{"title":"...", "startAt":"...", "endAt":"...", "participantIds":[...]}`|`200 OK``{ "calendarId":21, "updated": true }`|||MUST|
|캘린더 삭제(예약 취소)|DELETE|`/api/v1/calendar/{cId}`|(없음)|`200 OK``{ "ok": true }`|||MUST|

---

## 텍스트 채팅

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|텍스트 채팅 불러오기|GET|`/api/v1/rooms/{id}/chats`|Query: `?cursor&size=20` (기본 최신 10~20)|`200 OK``{ "items":[{ "chatId":1, "user":{...}, "content":"...", "createdAt":"..." }], "nextCursor":"..." }`|||MUST|
|채팅 수정|PATCH|`/api/v1/chats/{chatId}`|`{"content":"수정 내용"}`|`200 OK``{ "chatId":1, "content":"수정 내용", "updatedAt":"..." }`|||SHOULD|
|채팅 삭제|DELETE|`/api/v1/chats/{chatId}`|(없음)|`200 OK``{ "ok": true }`|||SHOULD|

---

## 회의실(OpenVidu 연동 액션)

> OpenVidu는 보통 “토큰 발급/세션 연결”이 핵심이라, join은 **토큰 반환** 형태가 가장 자연스러움.

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|음성 대화(회의 참가/토큰 발급)|POST|`/api/v1/rooms/{id}/meetings/join`|`{"meetingId": 5}` (또는 현재 진행중이면 생략)|`200 OK``{ "openviduUrl":"...", "token":"...", "sessionId":"..." }`|||MUST|
|화면 공유(상태 갱신/권한 기록용)|PUT|`/api/v1/meetings/{id}/screen`|`{"enabled": true}`|`200 OK``{ "enabled": true }`|||MUST|

---

## 이슈(GitHub 연동)

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|이슈 생성|POST|`/api/v1/rooms/{id}/issues`|`{"title":"...", "body":"...", "labels":["bug"], "assignees":["abc"]}`|`201 Created``{ "issueNumber": 12, "githubUrl":"...", "createdAt":"..." }`|||MUST|
|(권장) 이슈 목록/검색|GET|`/api/v1/rooms/{id}/issues`|Query: `?q=&state=open|closed&cursor&size`|`200 OK``[{ "issueNumber":12, "title":"...", "state":"open" }]`|||
|(권장) 이슈 템플릿 CRUD|GET/POST/PATCH/DELETE|`/api/v1/rooms/{id}/issue-templates`|템플릿 스키마|템플릿 목록/단건|||MUST|

---

## 회의 요약(STT + AI Summary)

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|회의록 생성(요약 생성 트리거)|POST|`/api/v1/meetings/{id}/summary`|`{"transcript":"..."}` 또는 `{"transcriptRef":"s3://..."}`|`202 Accepted``{ "jobId":"job_123", "status":"QUEUED" }`|||MUST|
|회의 녹음 시작|POST|`/api/v1/meetings/{mId}/record/start`|(없음)|`200 OK``{ "recording": true }`|||MUST|
|회의 녹음 종료|POST|`/api/v1/meetings/{mId}/record/stop`|(없음)|`200 OK``{ "recording": false, "audioRef":"..." }`|||MUST|
|(권장) 요약 Job 상태 조회|GET|`/api/v1/ai/jobs/{jobId}`|(없음)|`200 OK``{ "jobId":"...", "status":"RUNNING|DONE|FAILED", "resultRef":"...", "progress": 60 }`||

---

## 팀장(관리자 기능)

|기능|HTTP 메서드|API Path|Request|Response|진행도(백엔드)|진행도(프론트)|우선순위|
|---|---|---|---|---|---|---|---|
|방 생성|POST|`/api/v1/rooms`|`{"name":"방 이름", "thumbnailUrl":"..."(선택)}`|`201 Created``{ "roomId": 1, "name":"..." }`|||MUST|
|프로젝트 불러오기(레포 목록)|GET|`/api/v1/repos`|Query(선택): `?org=...&q=...`|`200 OK``[{ "repoId": 123, "fullName":"owner/repo", "private":true }]`|||MUST|
|위임자 선정(권한 부여/변경)|PATCH|`/api/v1/rooms/{id}/assign`|`{"userId": 8, "role":"ADMIN"}`|`200 OK``{ "ok": true }`|||MUST|
|팀원 삭제|DELETE|`/api/v1/rooms/{id}/members/{uId}`|(없음)|`200 OK``{ "ok": true }`|||MUST|
|조직 목록 조회|GET|`/api/v1/user/orgs`|(없음)|`200 OK``[{ "org":"my-org", "avatarUrl":"..." }]`|||SHOULD|
|초대 링크 생성|POST|`/api/v1/rooms/{id}/invites`|`{"expiresAt":"2026-01-23T00:00:00+09:00"(선택)}`|`201 Created``{ "inviteCode":"abcd", "inviteUrl":"...", "expiresAt":"..." }`|||MUST|
|팀원 추가(초대 링크로 참가)|POST|`/api/v1/rooms/join/{inviteCode}`|(없음)|`200 OK``{ "roomId": 1, "joined": true }`|||MUST|
