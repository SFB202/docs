# MileStone

### MUST로 끝내는 것(데모 필수)

- **Auth**: 로그인/세션유지/로그아웃 (FR-01~03)
    
- **Room**: 내 방 목록(사이드바), 방 생성(관리자), 초대 링크 생성+참가, 멤버 목록 (FR-09,11,17,19,13(축소),05)
    
- **Lounge**: 회의 리스트/최근 3개, 진행중 이슈 5개, 회의실 생성/삭제/이름수정 (FR-20~22(통계는 단순), FR-14, FR-21)
    
- **Chat**: 채팅 최신 20개 + 페이지네이션, 수정/삭제(본인) (FR-24~26)
    
- **Meeting(OpenVidu)**: join 토큰 발급 + 기본 음성 회의 진입 (FR-27)
    
- **Issue**: 이슈 생성(GitHub 반영) + 라운지 반영(폴링도 OK) (FR-33~34)
    
- **Summary**: 녹음 start/stop, 요약 생성 “트리거” + Job 상태 조회(최소) (FR-35~36 + (권장) job API)
    

### SHOULD는 1/30 이후로 밀기(혹은 버퍼 때 처리)

- 마이페이지 “다가오는 회의” 위젯, 고급 검색/하이라이트, 템플릿 CRUD 풀세트, 고급 알림 배지(정교한 unread), 화면공유 상태관리 등
    

---

# 마일스톤 (Milestones)

## M0. 기반 세팅 & 계약 확정 (1/16)

**Deliverable**

- API 계약 확정(OpenAPI skeleton / mock response 합의)
    
- DB 마이그레이션/시드, 권한 정책 초안
    
- OpenVidu/Redis/GitHub OAuth 환경변수 정리
    

---

## M1. 인증 + Room 기본 흐름 (1/19 ~ 1/20)

**Scope (FR / API)**

- FR-01~03, FR-09, FR-11, FR-17, FR-19, FR-05(최소)
    
- `/api/v1/auth/login`, `/api/v1/auth/logout`
    
- `/api/v1/rooms` (GET/POST)
    
- `/api/v1/rooms/{id}/participants`
    
- `/api/v1/rooms/{id}/invites`, `/api/v1/rooms/join/{inviteCode}`
    

**DoD**

- 로그인 후 사이드바에 방 리스트 뜸
    
- 방 생성 → 즉시 목록 반영
    
- 초대 링크 생성 → 다른 계정으로 join 가능
    
- 방 참여자 목록 확인 가능
    

---

## M2. 라운지 핵심(회의/이슈) + 캘린더 CRUD (1/21 ~ 1/23)

**Scope**

- FR-14, FR-20~22, FR-15~16, FR-31(축소), FR-34(최소)
    
- 회의/회의실:
    
    - `/api/v1/rooms/{id}/meetings`, `/recent`, `/search`
        
    - `/api/v1/rooms/{id}/sessions` (POST/DELETE/PATCH)
        
- 이슈: `/api/v1/rooms/{id}/issues/active`
    
- 캘린더: `/api/v1/rooms/{id}/calendar`, `/api/v1/calendar/{cId}`
    

**DoD**

- 라운지에서 “최근 회의/회의 리스트/진행중 이슈”가 정상 표시
    
- 회의 예약 CRUD가 캘린더에 반영(최소 UI)
    
- 회의실 생성/삭제/이름수정이 라운지에서 동작
    

---

## M3. 회의실(실시간) + 채팅 CRUD (1/26 ~ 1/28)

**Scope**

- FR-24~26, FR-27, FR-29
    
- 채팅: `/api/v1/rooms/{id}/chats`, `/api/v1/chats/{chatId}`
    
- 미팅 join: `/api/v1/rooms/{id}/meetings/join`
    

**DoD**

- 회의실 진입 → OpenVidu 토큰 받아 음성 참여 가능
    
- 채팅: 최신 20개 로드 + 무한스크롤/더보기 + 본인 수정/삭제
    

---

## M4. STT/요약 파이프라인 “최소 기능” + 이슈 생성 (1/29 ~ 1/30)

**Scope**

- FR-33, FR-35~36, FR-38(최소)
    
- 이슈 생성: `/api/v1/rooms/{id}/issues` (GitHub API 연동)
    
- 녹음/요약:
    
    - `/api/v1/meetings/{mId}/record/start`, `/record/stop`
        
    - `/api/v1/meetings/{id}/summary` (202 Accepted)
        
    - (권장) `/api/v1/ai/jobs/{jobId}`
        

**DoD**

- 회의 종료 → 요약 생성 트리거 → 라운지에 “회의록 생성됨”이 표시(실시간이 아니면 폴링으로라도 OK)
    
- 이슈 생성 → 라운지 active 리스트/카운트에 반영