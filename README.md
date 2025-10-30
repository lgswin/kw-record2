# KW한인장로교회 성도 관리 시스템

KW한인장로교회 성도들의 명단을 관리하고 출석을 체크하기 위한 웹 애플리케이션입니다.

## 🚀 기능

- **성도 등록**: 이름과 전화번호로 새 성도 추가
- **성도 조회**: 등록된 모든 성도 목록 확인
- **성도 수정**: 기존 성도 정보 변경
- **성도 삭제**: 불필요한 성도 정보 제거
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 🛠 기술 스택

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0
- **Container**: Docker, Docker Compose

## 📋 사전 요구사항

- Docker
- Docker Compose
- Git (선택사항)

## 🚀 Azure VM 배포 방법

### 1단계: 프로젝트 파일 업로드

#### 방법 1: SCP 사용
```bash
# SSH 키 파일을 사용한 업로드
scp -i /path/to/your-key.pem -r /path/to/kw-record2 azureuser@your-vm-ip:/home/azureuser/

# 예시 (AWS EC2 키 파일 사용)
scp -i ~/.ssh/your-key.pem -r /Users/gslee/Documents/kw-record2 azureuser@20.63.25.94:/home/azureuser/

# SSH 키 파일 권한 설정 (필요시)
chmod 400 /path/to/your-key.pem
```

#### 방법 2: Git 사용
```bash
# Azure VM에서 실행
git clone <your-repo-url>
cd kw-record2
```

### 2단계: 기존 컨테이너 정리 (필요시)

```bash
# 기존 컨테이너 중지 및 삭제
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# 기존 이미지 삭제
docker rmi $(docker images -q)

# 볼륨 정리
docker volume prune -f
```

### 3단계: 프로젝트 디렉토리로 이동

```bash
cd kw-record2
```

### 4단계: Docker 컨테이너 실행

```bash
# Docker 이미지 빌드 및 컨테이너 실행
docker-compose up -d

# 실행 상태 확인
docker-compose ps
```

### 5단계: 서비스 확인

```bash
# 로그 확인
docker-compose logs -f

# 컨테이너 상태 확인
docker ps
```

## 🌐 접속 방법

- **웹 애플리케이션**: `http://your-vm-ip:5001`
- **MySQL 데이터베이스**: `your-vm-ip:3306`

## 📊 데이터베이스 정보

- **데이터베이스명**: kwchurchdb
- **사용자명**: kwchurch
- **패스워드**: ads123
- **테이블**: members (id, name, phone, created_at, updated_at)

## 🔧 관리 명령어

### 컨테이너 관리
```bash
# 컨테이너 시작
docker-compose start

# 컨테이너 중지
docker-compose stop

# 컨테이너 재시작
docker-compose restart

# 컨테이너 완전 삭제
docker-compose down -v
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs app
docker-compose logs mysql

# 실시간 로그 확인
docker-compose logs -f
```

### 데이터베이스 접속
```bash
# MySQL 컨테이너에 접속
docker exec -it kwchurch-mysql mysql -u kwchurch -p

# 데이터베이스 선택
USE kwchurchdb;

# 테이블 확인
SHOW TABLES;

# 데이터 확인
SELECT * FROM members;
```

## 🔒 보안 설정

### 방화벽 설정 (Ubuntu)
```bash
# 필요한 포트만 열기
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 5001  # 애플리케이션 포트
sudo ufw enable
```

### SSL 인증서 설정 (선택사항)
```bash
# Let's Encrypt 인증서 설치
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

## 📝 환경 변수

`.env` 파일을 생성하여 환경 변수를 설정할 수 있습니다:

```env
DB_HOST=mysql
DB_USER=kwchurch
DB_PASSWORD=ads123
DB_NAME=kwchurchdb
PORT=5001
```

## 🐛 문제 해결

### 포트 충돌
```bash
# 포트 사용 중인 프로세스 확인
sudo netstat -tulpn | grep :5001

# 프로세스 종료
sudo kill -9 <PID>
```

### 컨테이너 재시작
```bash
# 특정 컨테이너 재시작
docker-compose restart app

# 모든 컨테이너 재시작
docker-compose restart
```

### 데이터베이스 연결 오류
```bash
# MySQL 컨테이너 상태 확인
docker-compose logs mysql

# MySQL 컨테이너 재시작
docker-compose restart mysql
```

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. Docker 서비스가 실행 중인지 확인
2. 포트가 올바르게 열려있는지 확인
3. 컨테이너 로그에서 오류 메시지 확인
4. 방화벽 설정 확인

## 📄 라이선스

MIT License

---

**KW한인장로교회 성도 관리 시스템 v1.0**
