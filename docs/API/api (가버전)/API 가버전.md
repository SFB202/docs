### 로그인/로그아웃

| 기능   | HTTP 메서드 | API Path            | Request | Response        | 진행도(백엔드) | 진행도(프론트) | 우선순위 |
| ---- | -------- | ------------------- | ------- | --------------- | -------- | -------- | ---- |
| 로그인  | GET      | /api/v1/auth/login  |         | Github Redirect |          |          |      |
| 로그아웃 | POST     | /api/v1/auth/logout |         |                 |          |          |      |

### 마이페이지

| 기능        | HTTP 메서드 | API Path         | Request | Response | 진행도(백엔드) | 진행도(프론트) | 우선순위 |
| --------- | -------- | ---------------- | ------- | -------- | -------- | -------- | ---- |
| 방 목록 확인   | GET      | /api/v1/rooms    |         |          |          |          |      |
| 프로필 사진 수정 | PATCH    | /api/v1/users/me |         |          |          |          |      |
### 라운지

| 기능              | HTTP 메서드 | API Path                           | Request | Response | 진행도(백엔드) | 진행도(프론트) | 우선순위 |
| --------------- | -------- | ---------------------------------- | ------- | -------- | -------- | -------- | ---- |
| 회의록 리스트 불러오기    | GET      | /api/v1/rooms/{id}/meetings        |         |          |          |          |      |
| 참여자 목록 불러오기     | GET      | /api/v1/rooms/{id}/participants    |         |          |          |          |      |
| 회의실 생성          | POST     | /api/v1/rooms/{id}/sessions        |         |          |          |          |      |
| 최근 회의록 3개 불러오기  | GET      | /api/v1/rooms/{id}/meetings/recent |         |          |          |          |      |
| 회의실 삭제          | DELETE   | /api/v1/rooms/{id}/sessions/{sId}  |         | 200 OK   |          |          |      |
| 회의실 이름 수정       | PATCH    | /api/v1/rooms/{id}/sessions/{sId}  |         |          |          |          |      |
| 진행중인 이슈 5개 불러오기 | GET      | /api/v1/rooms/{id}/issues/active   |         |          |          |          |      |
| 캘린더 생성          | POST     | /api/v1/rooms/{id}/calendar        |         |          |          |          |      |
| 캘린더 수정          | PATCH    | /api/v1/calendar/{cId}             |         |          |          |          |      |
| 캘린더 삭제          | DELETE   | /api/v1/calendar/{cId}             |         |          |          |          |      |
### 회의실

| 기능          | HTTP 메서드 | API Path                            | Request | Response | 진행도(백엔드) | 진행도(프론트) | 우선순위 |
| ----------- | -------- | ----------------------------------- | ------- | -------- | -------- | -------- | ---- |
| 텍스트 채팅 불러오기 | GET      | /api/v1/rooms/{id}/chats            |         |          |          |          |      |
| 채팅 수정       | PATCH    | /api/v1/chats/{chatId}              |         |          |          |          |      |
| 채팅 삭제       | DELETE   | /api/v1/chats/{chatId}              |         |          |          |          |      |
| 음성 대화       | POST     | /api/v1/rooms/{id}/meetings/join    |         |          |          |          |      |
| 화면 공유       | PUT      | /api/v1/meetings/{id}/screen        |         |          |          |          |      |
| 이슈 생성       | POST     | /api/v1/rooms/{id}/issues           |         |          |          |          |      |
| 회의록 생성      | POST     | /api/v1/meetings/{id}/summary       |         |          |          |          |      |
| 회의 녹음 시작    | POST     | /api/v1/meetings/{mId}/record/start |         |          |          |          |      |
| 회의 녹음 종료    | POST     | /api/v1/meetings/{mId}/record/stop  |         |          |          |          |      |
| 회의실 나가기     | DELETE   | /api/v1/meetings/{mId}/leave        |         |          |          |          |      |
### 관리자

| 기능        | HTTP 메서드 | API Path                         | Request | Response | 진행도(백엔드) | 진행도(프론트) | 우선순위 |
| --------- | -------- | -------------------------------- | ------- | -------- | -------- | -------- | ---- |
| 방 생성      | POST     | /api/v1/rooms                    |         |          |          |          |      |
| 프로젝트 불러오기 | GET      | /api/v1/repos                    |         |          |          |          |      |
| 위임자 선정    | PATCH    | /api/v1/rooms/{id}/assign        |         |          |          |          |      |
| 팀원추가      | POST     | /api/v1/rooms/{id}/members       |         |          |          |          |      |
| 팀원 삭제     | DELETE   | /api/v1/rooms/{id}/members/{uId} |         |          |          |          |      |