# 새 사용자 생성 가이드

새로운 사용자 계정을 만드는 방법을 안내합니다.

## 방법 1: 스크립트 사용 (간단)

### 로컬에서 실행

```bash
# 프로젝트 디렉토리로 이동
cd ~/kw-record2

# 스크립트 실행
node create_user.js
```

스크립트가 대화형으로 정보를 요청합니다:
- 사용자명 (필수)
- 비밀번호 (필수)
- 권한 (admin/user, 기본값: user)
- 이름 (선택사항)
- 이메일 (선택사항)

### 예시

```bash
$ node create_user.js
=== 새 사용자 생성 ===

사용자명 (username): john
비밀번호 (password): password123
권한 (admin/user) [기본값: user]: user
이름 (선택사항): John Doe
이메일 (선택사항): john@example.com

✅ 사용자가 성공적으로 생성되었습니다!

=== 생성된 사용자 정보 ===
ID: 2
사용자명: john
권한: user
이름: John Doe
이메일: john@example.com

⚠️  보안을 위해 로그인 후 비밀번호를 변경하세요!
```

### VM에서 실행

```bash
# VM에 SSH 접속
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203

# 프로젝트 디렉토리로 이동
cd ~/kw-record2

# 스크립트 실행
node create_user.js
```

---

## 방법 2: 웹 UI 사용 (관리자만)

관리자 권한으로 로그인한 후, 설정 페이지에서 사용자 관리 메뉴를 사용할 수 있습니다.

1. **관리자로 로그인**
   - 사용자명: `admin`
   - 비밀번호: `admin123` (또는 변경된 비밀번호)

2. **설정 페이지 접속**
   - 헤더의 "설정" 버튼 클릭

3. **사용자 관리**
   - 사용자 목록 확인
   - 새 사용자 추가
   - 사용자 정보 수정
   - 사용자 삭제

---

## 방법 3: API 직접 호출 (고급)

관리자 권한이 있는 경우, API를 직접 호출할 수 있습니다:

```bash
# 로그인하여 세션 쿠키 획득
curl -X POST http://20.151.51.203:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -c cookies.txt

# 새 사용자 생성
curl -X POST http://20.151.51.203:5001/api/users \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "username": "newuser",
    "password": "password123",
    "role": "user",
    "name": "New User",
    "email": "newuser@example.com"
  }'
```

---

## 사용자 권한

- **admin (관리자)**: 모든 기능 접근 가능, 사용자 관리 가능
- **user (일반사용자)**: 기본 기능만 접근 가능, 사용자 관리 불가

---

## 주의사항

1. **비밀번호 보안**
   - 강력한 비밀번호 사용 권장
   - 로그인 후 비밀번호 변경 권장

2. **사용자명 중복**
   - 동일한 사용자명은 사용할 수 없습니다

3. **관리자 계정**
   - 최소 1개의 관리자 계정은 유지해야 합니다
   - 마지막 관리자 계정은 삭제할 수 없습니다

---

## 문제 해결

### "이미 존재하는 사용자명입니다" 오류

다른 사용자명을 사용하세요.

### "권한이 필요합니다" 오류

관리자 권한이 필요합니다. 관리자 계정으로 로그인하세요.

### 스크립트 실행 오류

```bash
# 데이터베이스 연결 확인
node -e "const config = require('./config'); console.log(config);"

# 필요한 패키지 설치
npm install mysql2 bcrypt
```

