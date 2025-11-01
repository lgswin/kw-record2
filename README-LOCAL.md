# KW한인장로교회 성도 관리 시스템 - 로컬 실행 가이드

Docker 없이 로컬에서 직접 실행하는 방법입니다.

## 📋 사전 요구사항

- Node.js (v18 이상)
- MySQL 8.0 이상
- npm 또는 yarn

## 🚀 설치 및 실행

### 1단계: MySQL 데이터베이스 설정

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS kwchurchdb;

# 사용자 생성 및 권한 부여
CREATE USER IF NOT EXISTS 'kwchurch'@'localhost' IDENTIFIED BY 'ads123';
GRANT ALL PRIVILEGES ON kwchurchdb.* TO 'kwchurch'@'localhost';
FLUSH PRIVILEGES;

# 데이터베이스 선택
USE kwchurchdb;

# initi.sql 파일 실행
source initi.sql;

# 또는 파일에서 직접 실행
mysql -u root -p kwchurchdb < initi.sql
```

### 2단계: 프로젝트 의존성 설치

```bash
# 루트 디렉토리에서
npm install

# React 클라이언트 디렉토리에서
cd client
npm install
cd ..
```

### 3단계: 환경 설정

`config.js` 파일에서 MySQL 설정 확인:

```javascript
module.exports = {
  database: {
    host: 'localhost',
    user: 'root',
    password: 'ads123',  // MySQL root 패스워드
    database: 'kwchurchdb'
  },
  port: 5001
};
```

### 4단계: 서버 실행

**방법 1: 두 터미널 사용 (권장)**

터미널 1 - 백엔드 서버:
```bash
npm run server
# 또는
npm run dev  # nodemon 사용 (자동 재시작)
```

터미널 2 - React 클라이언트:
```bash
npm run client
```

**방법 2: 한 번에 실행**

```bash
# start.sh 파일 실행 권한 부여
chmod +x start.sh

# 실행
./start.sh
```

### 5단계: 접속

- **백엔드 API**: `http://localhost:5001`
- **프론트엔드**: `http://localhost:3000` (자동으로 열림)

## 🔧 문제 해결

### MySQL 연결 오류

```bash
# MySQL 서비스 확인
brew services list | grep mysql

# MySQL 시작
brew services start mysql

# 또는
sudo /usr/local/mysql/support-files/mysql.server start
```

### 포트 충돌

```bash
# 포트 5001 사용 중인 프로세스 확인
lsof -ti:5001

# 프로세스 종료
kill -9 $(lsof -ti:5001)

# 또는 server.js에서 포트 변경
```

### React 앱이 백엔드에 연결 안 될 때

`client/src/App.js`에서 API_URL 확인:
```javascript
const API_URL = 'http://localhost:5001/api';
```

## 📝 주요 명령어

```bash
# 백엔드 서버 시작
npm start          # 일반 실행
npm run dev        # nodemon 사용 (개발 모드)
npm run server      # nodemon 사용

# React 클라이언트 시작
npm run client

# React 프로덕션 빌드
npm run build
```

## 🗂 프로젝트 구조

```
kw-record2/
├── server.js           # Express 백엔드 서버
├── config.js           # 데이터베이스 설정
├── package.json        # 백엔드 의존성
├── client/             # React 프론트엔드
│   ├── src/
│   │   ├── App.js      # 메인 컴포넌트
│   │   └── App.css     # 스타일
│   └── package.json    # 프론트엔드 의존성
└── initi.sql           # 데이터베이스 초기화 스크립트
```

## 📞 지원

문제가 발생하면:
1. MySQL 서비스가 실행 중인지 확인
2. 포트가 올바르게 열려있는지 확인
3. 데이터베이스 연결 정보 확인 (`config.js`)
4. 서버/클라이언트 로그 확인

---

**KW한인장로교회 성도 관리 시스템 v1.0**

