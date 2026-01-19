# Git 컨벤션

## 1) 기본 원칙

- 기본 브랜치: `master`
    
- `master` 직접 push 금지 → **PR로만 머지**
    
- `master`는 항상 **동작 가능한 상태** 유지
    
- 작업은 **이슈 기반**으로만 진행 (브랜치 생성 전 이슈 생성)
    

---

## 2) 브랜치 전략 (GitHub Flow)

1. `master`에서 브랜치 생성
    
2. 작업 후 커밋
    
3. PR 생성
    
4. **AI 1차 코드리뷰 → 사람 리뷰 → 머지**
    
5. 머지 후 브랜치 삭제
    

---

## 3) 브랜치 네이밍 규칙 (필수)

### type (3개만)

- `feat` : 기능 개발
    
- `bug` : 버그 수정
    
- `task` : 그 외 작업(리팩토링/문서/테스트/설정/CI 등)
    

### 형식

`<type>/#<issueNo>-<short-desc>`

- `<issueNo>`: `#` 포함 숫자(예: `#126`) **필수**
    
- `<short-desc>`: `kebab-case`, 짧게 작성
    

예:

- `feat/#126-auth-login`
    
- `bug/#88-rooms-list-null`
    
- `task/#310-ci-junit-report`
    

규칙:

- 이슈 번호 없는 브랜치 생성 금지
    
- 여러 이슈를 함께 처리하면 **대표 이슈 1개만 브랜치에 사용**, 나머지는 PR에 `Refs #...`로 연결
    

---

## 4) 커밋 메시지 규칙

### 형식

`<message>`

### 작성 규칙

- 동사로 시작(예: add/fix/update/remove/refactor/implement…)
    
- 한 줄로 “무엇이 바뀌었는지” 명확히
    
- 불필요한 접두사/이모지/WIP 지양
    
- 한글 사용 가능
    
- 너무 공들일 필요 없음 (Squash merge로 `master`에는 상세 커밋이 남지 않음)
    

예:

- `implement auth login`
    
- `fix rooms list null handling`
    
- `add junit report workflow`
    
- `refactor user service methods`
    
- `add user service unit tests`
    

---

## 5) PR 규칙

### PR 제목

`[#<issueNo>] <type>: <summary>`

예:

- `[#126] feat: auth login 구현`
    

### PR 본문(최소)

- 변경 요약(1~3줄)
    
- 테스트 방법
    
- 이슈 연결
    
    - 자동 종료: `Closes #126`
        
    - 참조: `Refs #126`
        

---

## 6) 코드 리뷰 프로세스 (AI 1차 리뷰 필수)

1. PR 생성
    
2. **AI에게 1차 코드리뷰 요청(필수)**
    
3. AI 피드백 반영
    
4. 사람 리뷰(최소 1명) 승인
    
5. CI 통과 후 머지
    

---

## 7) 머지 방식

- 기본: **Squash merge 권장**
    
- 머지 후 브랜치 삭제
    