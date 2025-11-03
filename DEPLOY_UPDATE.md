# 서버 업데이트 배포 가이드

새로운 코드를 서버에 배포하고 실행하는 방법입니다.

## 📋 배포 전 준비사항

1. 로컬에서 모든 변경사항이 Git에 커밋되어 있는지 확인
2. GitHub 저장소에 푸시되어 있는지 확인
3. 서버(VM)에 SSH 접속 정보 확인

## 🚀 배포 절차

### 1단계: 로컬에서 Git에 커밋 및 푸시

```bash
# 현재 디렉토리 확인
cd /Users/gslee/Documents/kw-record2

# 변경사항 확인
git status

# 변경사항 커밋
git add .
git commit -m "업데이트 내용 설명 (예: 숨기기/보이기 기능 추가)"

# GitHub에 푸시
git push origin main
# 또는
git push origin master
```

### 2단계: 서버(VM)에 SSH 접속

```bash
# Azure VM 접속 (SSH 키 경로는 본인의 키 경로로 변경)
ssh -i ~/.ssh/kwchurchr-record-new.pem azureuser@20.151.51.203

# 또는 사용자명이 다른 경우
ssh -i ~/.ssh/kwchurchr-record-new.pem <사용자명>@<VM-IP>
```

### 3단계: 프로젝트 디렉토리로 이동

```bash
cd ~/kw-record2
# 또는
cd /home/azureuser/kw-record2
```

### 4단계: 최신 코드 가져오기

```bash
# 현재 실행 중인 앱 상태 확인
pm2 status

# Git에서 최신 코드 가져오기
git pull origin main
# 또는
git pull origin master

# pull 후 변경사항 확인 (선택사항)
git log --oneline -5
```

### 5단계: 의존성 업데이트 (필요시)

```bash
# 새로운 패키지가 추가되었거나 package.json이 변경된 경우에만 실행
npm install

# 클라이언트 의존성 업데이트 (필요시)
cd client
npm install
cd ..
```

### 6단계: React 프로덕션 빌드

```bash
# React 앱을 프로덕션용으로 빌드
cd client
npm run build
cd ..
```

### 7단계: PM2로 애플리케이션 재시작

```bash
# 현재 실행 중인 앱 중지
pm2 stop kw-church-api

# 또는 재시작 (더 간단한 방법)
pm2 restart kw-church-api

# NODE_ENV 환경 변수 명시적으로 설정하여 재시작
NODE_ENV=production pm2 restart kw-church-api --update-env

# 또는 완전히 새로 시작하려면
pm2 delete kw-church-api
NODE_ENV=production pm2 start server.js --name kw-church-api
pm2 save
```

### 8단계: 상태 확인

```bash
# PM2 프로세스 상태 확인
pm2 status

# 로그 확인 (오류 확인용)
pm2 logs kw-church-api

# 또는 최근 로그만 보기
pm2 logs kw-church-api --lines 50
```

## ✅ 배포 확인

브라우저에서 접속하여 확인:
- `http://<VM-IP>:5001` (예: `http://20.151.51.203:5001`)

## 🔄 빠른 배포 스크립트 (선택사항)

서버에서 다음 명령어들을 한 번에 실행하려면:

```bash
cd ~/kw-record2 && \
git pull origin main && \
npm install && \
cd client && npm install && npm run build && cd .. && \
pm2 restart kw-church-api
```

또는 스크립트 파일을 만들어 사용할 수 있습니다:

```bash
# deploy.sh 파일 생성
cat > ~/kw-record2/deploy.sh << 'EOF'
#!/bin/bash
cd ~/kw-record2
echo "Git에서 최신 코드 가져오는 중..."
git pull origin main
echo "의존성 업데이트 중..."
npm install
cd client && npm install && cd ..
echo "React 빌드 중..."
cd client && npm run build && cd ..
echo "애플리케이션 재시작 중..."
NODE_ENV=production pm2 restart kw-church-api
echo "배포 완료!"
pm2 status
EOF

# 실행 권한 부여
chmod +x ~/kw-record2/deploy.sh

# 사용 방법
~/kw-record2/deploy.sh
```

## 🐛 문제 해결

### Git pull 실패 시
```bash
# 로컬 변경사항이 있어서 충돌이 발생한 경우
git status
git stash  # 로컬 변경사항 임시 저장
git pull origin main
git stash pop  # 필요시 변경사항 복원
```

### 빌드 오류 시
```bash
# 클라이언트 디렉토리 정리 후 재빌드
cd client
rm -rf node_modules build
npm install
npm run build
cd ..
```

### PM2 재시작 실패 시
```bash
# PM2 프로세스 완전히 제거 후 재시작
pm2 delete kw-church-api
cd ~/kw-record2
NODE_ENV=production pm2 start server.js --name kw-church-api
pm2 save
```

### 포트 충돌 시
```bash
# 포트 사용 중인 프로세스 확인
sudo netstat -tulpn | grep :5001

# PM2로 모든 프로세스 확인
pm2 list
pm2 logs
```

### 데이터베이스 연결 오류 시
```bash
# MySQL 서비스 상태 확인
sudo systemctl status mysql

# MySQL 재시작
sudo systemctl restart mysql
```

## 📝 주의사항

1. **배포 전 데이터 백업**: 중요한 데이터가 있는 경우 배포 전에 백업을 권장합니다.
2. **점검 시간**: 사용자가 적은 시간에 배포하는 것을 권장합니다.
3. **점진적 배포**: 큰 변경사항이 있는 경우 테스트 후 배포하세요.
4. **로그 모니터링**: 배포 후 로그를 확인하여 오류가 없는지 확인하세요.

## 🔍 배포 상태 모니터링

```bash
# 실시간 로그 확인
pm2 logs kw-church-api --lines 100

# CPU/메모리 사용량 확인
pm2 monit

# 특정 시간대 로그 확인
pm2 logs kw-church-api --lines 1000 | grep "2024"
```

---

**마지막 업데이트**: 2024년
