
![[architecture.svg]]

### Frontend (FE)

- **React**
    

### Reverse Proxy / Ingress

- **Traefik** 
    

### Backend (BE)

- **Java**
    
- **Spring Boot**
    
- **Spring WebFlux**
    
- **JPA**
    
- **SSE (Server-Sent Events)** 
    

### AI / Worker (문서 요약 파이프라인)

- **ffmpeg** _(webm → wav 변환)_
    
- **Whisper STT** _(전사)_
    
- **Claude API** _(요약/정리: summary, decisions, action_items, agenda, keywords)_
    
- **python-docx** _(DOCX 생성 옵션)_
    

### Media Server

- **OpenVidu** _(WebRTC + audio-only recording)_
    

### Messaging / Event Bus

- **Redis (Pub/Sub 또는 Streams 권장)**
    
    - Spring → FastAPI 작업 요청 이벤트 / FastAPI → Spring 진행도·완료 이벤트
        

### Data (DB / Search)

- **MySQL** _(Source of Truth)_
    
- **Elasticsearch** _(검색/인덱싱)_
    

### Infra / DevOps

- **Docker Engine / Docker Compose** _(서비스 컨테이너 구성/배포)_
    
- **GitLab CI/CD** _(빌드/테스트/배포 자동화)_


### Storage

- **Docker Volume**
    


### OS

- **Ubuntu Server 20.04** _(호스트 OS)_
    
- **Alpine Linux** _(컨테이너 베이스 이미지/경량 런타임)_