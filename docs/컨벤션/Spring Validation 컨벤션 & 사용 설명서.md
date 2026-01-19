# Spring Validation 컨벤션 & 사용 설명서

## 1) 목적

- Controller 입력(Request DTO)을 **일관된 규칙으로 검증**하고,
    
- 검증 실패 시 **400(Bad Request)**로 통일된 에러 응답을 만든다.
    
- “요청 바인딩/검증”은 Controller 계층에서 처리하고, Service는 가능한 한 “정상 입력”을 받는 구조로 간다.
    

---

## 2) 적용 범위

### 2.1 Request DTO(Record/Class)

- `@RequestBody`로 받는 JSON 요청 DTO는 **Bean Validation 애너테이션으로 검증**
    
- Path/Query 파라미터도 필요하면 검증(예: `@Min(1)`)
    

### 2.2 Service 내부 검증

- 원칙: 입력 형식/길이 같은 것은 Controller에서 끝낸다.
    
- Service는 **도메인 규칙/상태 검증**(존재 여부, 중복, 권한 등)을 담당하고 `Result.fail(...)`로 표현한다.
    

---

## 3) 기본 사용법(필수 패턴)

### 3.1 RequestBody 검증

```java
@PostMapping("/api/v1/auth/login")
public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
    ...
}
```

- `@Valid`가 없으면 애너테이션이 있어도 검증이 안 됨.
    
- 검증 실패 시 `MethodArgumentNotValidException` 발생(ControllerAdvice로 처리 권장).
    

### 3.2 Path/Query 파라미터 검증

- 컨트롤러 클래스에 `@Validated`를 붙여야 파라미터 검증이 동작한다.
    

```java
@Validated
@RestController
class RoomController {

  @GetMapping("/api/v1/rooms/{id}")
  public ResponseEntity<?> get(@PathVariable @Min(1) Long id) { ... }
}
```

검증 실패 시 `ConstraintViolationException` 발생.

---

## 4) DTO 작성 컨벤션 (너 예시 스타일)

### 4.1 DTO는 record 권장

- 단순 요청/응답에 적합, 불변이라 안전
    

```java
public record LoginRequest(
  @NotBlank
  @Size(min = 4, max = 20)
  @Pattern(regexp = "^[a-z0-9]{4,20}$", message = "...")
  String loginId,

  @NotBlank
  @Pattern(regexp = "...", message = "...")
  String password
) {}
```

### 4.2 애너테이션 순서(권장)

1. `@NotNull` / `@NotBlank`
    
2. `@Size` / `@Min` / `@Max`
    
3. `@Pattern`
    
4. 커스텀 애너테이션(필요 시)
    

> 이유: 읽기 흐름(존재 → 범위 → 형식)

### 4.3 메시지 컨벤션

- 메시지는 **사용자에게 보여줄 수 있는 문장**으로 작성
    
- 동일한 규칙은 가능한 한 동일 문구를 사용(일관성)
    
- 메시지를 완전히 고정하지 않아도 됨(테스트는 주로 field + code로)
    

---

## 5) 정규식/길이 “중복 금지” 규칙

정규식이 여러 DTO에 반복되면 유지보수가 어려우니, 가능하면 **공통 상수**로 분리한다.

```java
public final class ValidationRules {
  public static final String LOGIN_ID = "^[a-z0-9]{4,20}$";
  public static final String PASSWORD = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[~!@#$%^&*()_+\\-=?{}\\[\\]|:;\"'<>,./]).{8,20}$";
  private ValidationRules() {}
}
```

그리고 DTO에서는:

```java
@Pattern(regexp = ValidationRules.LOGIN_ID, message = "...")
String loginId
```

---

## 6) 검증 실패 응답 컨벤션 (강력 권장)

검증 실패는 Service의 `Result`가 아니라, Controller 레벨에서 예외로 터지므로 **ControllerAdvice에서 표준 응답을 만든다**.

### 6.1 표준 에러 응답(JSON) 예시

```json
{
  "code": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "loginId", "message": "로그인 아이디는 ...", "rejectedValue": "Abc" },
    { "field": "password", "message": "비밀번호는 ...", "rejectedValue": null }
  ]
}
```

### 6.2 ControllerAdvice에서 처리 규칙

- `MethodArgumentNotValidException` (RequestBody)
    
- `ConstraintViolationException` (Path/Query)
    
- 둘 다 **HTTP 400**으로 통일
    

---

## 7) Result와 Validation의 역할 분리(팀 규칙)

### Controller Validation(400)

- 형식/길이/nullable 같은 “입력 스키마” 문제
    
- 예: loginId가 3자, 대문자 포함, password 패턴 불일치
    

### Service Result(4xx/5xx)

- 도메인 규칙/상태 문제
    
- 예:
    
    - 존재하지 않는 유저: 404
        
    - 비밀번호 불일치: 401(또는 정책상 404)
        
    - 권한 없음: 403
        
    - 중복: 409
        
    - 서버 내부 예외: 500(ServerError)
        

> 결론: “입력 검증 실패는 Validation으로 400”, “비즈니스 실패는 ResultError로 4xx/5xx”

---

## 8) 작성 가이드(자주 쓰는 애너테이션)

### 문자열

- `@NotBlank` : 공백/빈문자열 금지
    
- `@Size(min, max)` : 길이 제한
    
- `@Pattern(regexp=...)` : 형식 제한
    
- 이메일: `@Email`
    

### 숫자/ID

- `@NotNull`
    
- `@Min(1)` : id는 보통 1 이상
    
- `@Positive` 도 가능
    

### 컬렉션

- `@NotEmpty`
    
- `@Size(max=...)`
    

### 중첩 객체

- 필드에 `@Valid`를 붙여 내부도 검증
    

```java
public record Wrapper(@Valid Inner inner) {}
```

---

## 9) 테스트 컨벤션(Validation 관련)

- Request DTO Validation은 보통 **Controller 테스트(@WebMvcTest)**에서 검증한다.
    
- “DTO 자체”를 검증하고 싶으면 `jakarta.validation.Validator`로 단위 테스트 가능하지만, 팀 기준으로는 컨트롤러 테스트가 더 실용적.
    

---

## 10) LoginRequest 예시 기준 권장 보완

현재 `loginId`는 `@Size`와 `@Pattern`에 길이가 중복돼 있어.  
둘 중 하나로 줄여도 됨.

- 선택 1) `@Pattern`에 길이 포함 → `@Size` 제거
    
- 선택 2) `@Size`로 길이, `@Pattern`은 문자셋만 체크(가독성↑)
    

예: 선택 2

```java
@NotBlank
@Size(min=4, max=20)
@Pattern(regexp="^[a-z0-9]+$", message="로그인 아이디는 영문 소문자와 숫자만 가능합니다.")
String loginId
```