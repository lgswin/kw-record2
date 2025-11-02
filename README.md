# KW한인장로교회 성도 관리 시스템

KW한인장로교회 성도들의 명단을 관리하고 출석을 체크하기 위한 웹 애플리케이션입니다.

## 🚀 기능

- **성도 관리**: 성도 등록, 조회, 수정, 삭제
- **가족 관리**: 가족 단위로 성도 관리
- **순모임 관리**: 순모임별 성도 관리
- **부서 관리**: 부서별 성도 관리 (직책별 할당)
- **검색 기능**: 이름, 전화번호, 주소 등으로 검색
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 🛠 기술 스택

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0

## 📋 사전 요구사항

- Node.js 16.x 이상
- npm 또는 yarn
- MySQL 8.0
- Git (선택사항)

## 🚀 로컬 개발 환경 설정

### 1단계: 프로젝트 클론

```bash
git clone <your-repo-url>
cd kw-record2
```

### 2단계: 의존성 설치

```bash
# 루트 디렉토리에서
npm install

# 클라이언트 디렉토리에서
cd client
npm install
cd ..
```

### 3단계: 데이터베이스 설정

```bash
# MySQL 접속
mysql -u root -p

# 데이터베이스 생성 및 초기화
mysql -u root -p < initi.sql
```

또는 MySQL 접속 후:
```sql
CREATE DATABASE kwchurchdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kwchurchdb;
SOURCE initi.sql;
```

### 4단계: 설정 파일 확인

`config.js` 파일에서 데이터베이스 연결 정보 확인:
```javascript
module.exports = {
  database: {
    host: 'localhost',
    user: 'root',
    password: 'ads123',
    database: 'kwchurchdb'
  },
  port: 5001
};
```

### 5단계: 애플리케이션 실행

**방법 1: 별도 터미널에서 실행**

```bash
# 터미널 1: 백엔드 서버 실행
npm run dev
# 또는
node server.js

# 터미널 2: 프론트엔드 개발 서버 실행
npm run client
```

**방법 2: start.sh 스크립트 사용**

```bash
chmod +x start.sh
./start.sh
```

## 🌐 접속 방법

- **웹 애플리케이션**: `http://localhost:3000` (개발 서버) 또는 `http://localhost:5001` (프로덕션 빌드)
- **API 서버**: `http://localhost:5001/api`
- **MySQL 데이터베이스**: `localhost:3306`

## 📊 데이터베이스 정보

- **데이터베이스명**: kwchurchdb
- **사용자명**: root
- **패스워드**: ads123
- **테이블**: members, families, parties, departments, offices 등

## 🚀 Azure VM 배포 방법

### 1단계: 프로젝트 파일 업로드

#### 방법 1: SCP 사용
```bash
# SSH 키 파일을 사용한 업로드
scp -i /path/to/your-key.pem -r /path/to/kw-record2 azureuser@your-vm-ip:/home/azureuser/

# 예시
scp -i ~/.ssh/kwchurchr-record-new.pem -r /Users/gslee/Documents/kw-record2 azureuser@20.63.25.94:/home/azureuser/

# SSH 키 파일 권한 설정 (필요시)
chmod 400 /path/to/your-key.pem
```

#### 방법 2: Git 사용
```bash
# Azure VM에서 실행
git clone <your-repo-url>
cd kw-record2
```

### 2단계: Node.js 및 MySQL 설치

```bash
# Node.js 18.x 설치
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MySQL 설치 (아직 설치되지 않은 경우)
sudo apt update
sudo apt install mysql-server -y
```

### 3단계: 프로젝트 설정

```bash
cd kw-record2

# 의존성 설치
npm install
cd client && npm install && cd ..

# 데이터베이스 초기화
mysql -u root -p < initi.sql
```

### 4단계: 애플리케이션 실행

```bash
# 개발 환경에서 실행
npm run dev & npm run client

# 또는 프로덕션 빌드
cd client && npm run build && cd ..
NODE_ENV=production node server.js
```

### 5단계: PM2로 백그라운드 실행 (권장)

```bash
# PM2 설치
sudo npm install -g pm2

# 백엔드 서버 실행
pm2 start server.js --name "kw-church-api"

# 프론트엔드는 별도로 실행하거나 빌드하여 서빙
```

## 🔒 보안 설정

### 방화벽 설정 (Ubuntu)
```bash
# 필요한 포트만 열기
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5001  # 애플리케이션 포트
sudo ufw allow 3000  # React 개발 서버 (개발 환경)
sudo ufw enable
```

### SSL 인증서 설정 (선택사항)
```bash
# Let's Encrypt 인증서 설치
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

## 📝 환경 변수

환경 변수는 `config.js` 파일에서 관리하거나, 서버에서 환경 변수로 설정할 수 있습니다:

```bash
export DB_HOST=localhost
export DB_USER=root
export DB_PASSWORD=ads123
export DB_NAME=kwchurchdb
export PORT=5001
```

## 🐛 문제 해결

### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
sudo netstat -tulpn | grep :5001

# 프로세스 종료
sudo kill -9 <PID>
```

### MySQL 연결 오류
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 재시작
sudo systemctl restart mysql

# MySQL 접속 테스트
mysql -u root -p
```

### Node.js 버전 확인
```bash
node --version
npm --version
```

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. Node.js와 MySQL이 올바르게 설치되어 있는지 확인
2. 포트가 올바르게 열려있는지 확인
3. 데이터베이스 연결 정보가 올바른지 확인
4. 방화벽 설정 확인

## 📄 라이선스

MIT License

---

**KW한인장로교회 성도 관리 시스템 v1.0**
