``` mermaid
flowchart LR
  U["User Browser<br/>React SPA"] -->|HTTPS| RP["Reverse Proxy<br/>Traefik"]

  RP --> FE["Frontend Static<br/>React Build"]
  RP --> API["Backend API<br/>Java Spring Boot"]
  RP --> OV["Media Server<br/>OpenVidu"]

  U <-->|WS or SSE<br/>Realtime notify chat| RP
  RP <-->|WS or SSE| API

  U <-->|WebRTC Media<br/>Audio Video| OV
  API <-->|Session Token control| OV

  API --> DB[("MySQL")]
  API --> ES[("Elasticsearch")]
  API --> GH["GitHub API"]

  subgraph HOST["Host OS<br/>Ubuntu Server 20.04"]
    subgraph DOCKER["Docker Engine<br/>Docker Compose"]
      RP
      FE
      API
      OV
      DB
      ES
    end
  end

  subgraph CICD["GitLab CI/CD"]
    CI["Build Test<br/>Docker image build"] --> CD["Deploy<br/>Compose update restart"]
  end

  CICD --> HOST
  note["Container Base<br/>Alpine Linux"] -.-> DOCKER

```
![[architecture.svg]]
### Frontend (FE)

- **React**
    

### Reverse Proxy / Ingress
-  **Traefik**

### Backend (BE)

- **Java**
    
- **Spring Boot**
    
- **Spring WebFlux**
    
- **JPA**
    

### Media Server

- **OpenVidu**
    

### Data (DB / Search)

- **MySQL**
    
- **Elasticsearch**
    

### Infra / DevOps

- **Docker Engine / Docker Compose**
    
- **GitLab CI/CD**
    

### OS

- **Ubuntu Server 20.04** _(호스트 OS)_
    
- **Alpine Linux** _(컨테이너 베이스 이미지/경량 런타임)_
    