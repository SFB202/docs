# Result 사용 설명서

## 1) 목적

`Result<T>`는 예외 대신 **성공/실패를 값으로 반환**하기 위한 공통 타입이다.

- 성공: `Result.ok(value)` 또는 값 없는 성공: `Result.ok()`
    
- 실패: `Result.fail(error)` 또는 `Result.fail(errors)`
    
- 실패에는 `List<ResultError>`가 들어가며, `ResultError.getCode()`는 **HTTP Status Code**로 사용한다.
    

---

## 2) 핵심 개념

### 2.1 Result 구조

- `value`: 성공 시 결과 값(T). 실패 시 `null`
    
- `success`: 성공 여부
    
- `errors`: 실패 시 에러 목록(최소 1개), 성공 시 빈 리스트
    

### 2.2 ResultError 구조

`ResultError`는 **API 에러 계약**을 담는다.

- `getCode()`: HTTP status code (예: 400, 401, 403, 404, 409, 500)
    
- `getMessage()`: 사용자/로그 메시지
    
- `getMetadata()`: 부가 정보(Map) (resource, key, field 등)
    
- `getStatus()`: `HttpStatus.valueOf(getCode())` 기본 제공
    

> 규칙: `getCode()`는 반드시 유효한 HTTP status code여야 한다. (아니면 `getStatus()`에서 예외 발생)

---

## 3) 생성 방법

### 3.1 성공 반환

```java
return Result.ok(userId);      // 값이 있는 성공
return Result.ok();            // 값이 없는 성공(Result<Void>)
```

### 3.2 실패 반환 (단일 에러)

```java
return Result.fail(new NotFoundError("user", userId));
return Result.fail(new ConflictError("loginId", loginId));
```

### 3.3 실패 반환 (복수 에러)

```java
List<ResultError> errors = List.of(
  new SimpleError(400, "name is blank"),
  new SimpleError(400, "password too short")
);
return Result.fail(errors);
```

### 3.4 간단 실패(코드/메시지)

```java
return Result.fail(400, "invalid request");
```

---

## 4) 상태 조회 / 값 꺼내기

### 4.1 성공/실패 체크

```java
if (result.isSuccess()) { ... }
if (result.isFailure()) { ... }
```

### 4.2 Optional로 값 받기

```java
result.getValue().ifPresent(v -> ...);
T value = result.getValue().orElse(defaultValue);
```

### 4.3 예외로 변환해서 처리하기

서비스 내부에서 “실패면 바로 중단”하고 싶으면:

```java
T value = result.getOrThrow();  // 실패면 ResultException(errors) throw
```

또는 원하는 예외로:

```java
T value = result.getOrThrow(new IllegalStateException("something wrong"));
```

### 4.4 실패에서 단일 에러 꺼내기

```java
ResultError err = result.getSingleErrorOrThrow();
```

> 주의: errors가 비어있으면 `NoSuchElementException("no result")`가 발생한다.

---

## 5) 함수형(Fluent) 조합 사용법

### 5.1 map (성공 값 변환)

- 성공이면 mapper 적용
    
- 실패면 errors 그대로 유지한 채 타입만 바뀜
    

```java
Result<UserModel> r1 = userService.findUserById(id);
Result<UserDto> r2 = r1.map(UserDto::from);
```

### 5.2 flatMap (성공 시 다음 Result로 연결)

```java
Result<UserModel> r =
  userService.findUserById(id)
    .flatMap(user -> permissionService.check(user, viewerId))
    .flatMap(ignored -> profileService.loadProfile(id));
```

> 규칙: **중간에 한 번이라도 fail이면 이후 체인은 실행되지 않고 그대로 fail**이 전달됨.

---

## 6) 부수효과 훅

### 6.1 onSuccess

```java
userService.createUser(cmd)
  .onSuccess(id -> log.info("created userId={}", id));
```

### 6.2 onFailure

```java
userService.createUser(cmd)
  .onFailure(errors -> log.warn("createUser failed: {}", errors));
```

> `onSuccess/onFailure`는 “로깅/메트릭”처럼 **부수효과**에만 쓰고, 비즈니스 로직은 넣지 않는 것을 권장.

---

## 7) 에러 누적(immutable)

### 7.1 withError

```java
return Result.fail(new SimpleError(400, "invalid"))
  .withError(new SimpleError(400, "another issue"));
```

### 7.2 withErrors

```java
return baseResult.withErrors(extraErrors);
```

> `Result`는 immutable이므로 `withError(s)`는 **새로운 Result**를 반환한다.

---

## 8) throwIfFailure

실패면 `ResultException(errors)`를 던지고, 성공이면 그대로 반환한다.

```java
result.throwIfFailure();
// 이후는 성공 보장
```

---

## 9) ServerError 사용법

`ServerError`는 내부 처리 중 “예상치 못한 문제”를 500으로 표현한다.

```java
return Result.fail(new ServerError("user", userId));
```

`metadata`는 다음을 포함한다:

- `resource`: resourceName
    
- `key`: key
    

---

## 10) MVC에서 권장 사용 패턴

### 10.1 Service 레이어

- **Service는 Result를 반환**한다.
    
- 예외는 정말 “복구 불가/프로그래밍 오류”일 때만.
    

```java
public Result<Long> createUser(CreateUserCommand cmd) {
  if (repo.existsByLoginId(cmd.getLoginId())) {
    return Result.fail(new ConflictError("loginId", cmd.getLoginId()));
  }
  Long id = repo.save(...);
  return Result.ok(id);
}
```

### 10.2 Controller 레이어

Controller는 Result를 HTTP 응답으로 변환한다. (2가지 방식 중 택1)

#### 방식 A) Controller에서 직접 변환 (간단)

```java
@PostMapping("/users")
public ResponseEntity<?> create(@RequestBody CreateUserRequest req) {
  Result<Long> r = userService.createUser(req.toCommand());

  if (r.isSuccess()) return ResponseEntity.ok(Map.of("id", r.getValue().orElseThrow()));

  ResultError e = r.getSingleErrorOrThrow();
  return ResponseEntity.status(e.getStatus()).body(Map.of(
    "code", e.getCode(),
    "message", e.getMessage(),
    "metadata", e.getMetadata()
  ));
}
```

#### 방식 B) 실패를 예외로 올리고 @ControllerAdvice에서 처리 (권장: 중복 제거)

- Controller에서는 `getOrThrow()` or `throwIfFailure()`로 실패를 예외로 변환
    
- `@ControllerAdvice`가 `ResultException`을 잡아 공통 응답 생성
    

```java
@PostMapping("/users")
public Map<String, Object> create(@RequestBody CreateUserRequest req) {
  Long id = userService.createUser(req.toCommand()).getOrThrow();
  return Map.of("id", id);
}
```

---

## 11) 팀 규칙(권장)

- `ResultError.getCode()`는 HTTP Status Code로 통일한다. (400/401/403/404/409/500…)
    
- 실패는 최소 1개 이상의 errors를 가져야 한다. (`Result.fail(List)`는 빈 리스트 금지)
    
- message는 변경 가능성이 있으니, 계약은 `code + metadata` 중심으로 본다.
    
- 복수 validation 에러는 `fail(List<ResultError>)`로 반환한다.
    

---

## 12) 자주 쓰는 레시피

### 레시피 1) “실패면 바로 중단”

```java
User user = userService.findUserById(id).getOrThrow();
```

### 레시피 2) “체이닝으로 검증 → 처리”

```java
return validator.validate(cmd)
  .flatMap(valid -> userService.createUser(cmd))
  .map(id -> new CreateUserResponse(id));
```

### 레시피 3) “실패에 메타데이터 추가”

```java
return Result.fail(new SimpleError(400, "invalid"))
  .withError(new SimpleError(400, "field missing", Map.of("field", "name")));
```
