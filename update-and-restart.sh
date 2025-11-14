#!/bin/bash
# Git pull 후 변경사항을 반영하는 스크립트

echo "=========================================="
echo "업데이트 및 재시작 스크립트"
echo "=========================================="

# 1. Git pull (강제)
echo ""
echo "[1/5] Git pull 중..."
cd ~/kw-record2
git fetch origin main
git reset --hard origin/main
echo "✓ Git pull 완료"

# 2. 서버 의존성 업데이트
echo ""
echo "[2/5] 서버 의존성 설치 중..."
npm install
echo "✓ 서버 의존성 설치 완료"

# 3. 클라이언트 의존성 업데이트
echo ""
echo "[3/5] 클라이언트 의존성 설치 중..."
cd client
npm install
cd ..
echo "✓ 클라이언트 의존성 설치 완료"

# 4. React 빌드 (프로덕션용)
echo ""
echo "[4/5] React 프로덕션 빌드 중..."
cd client
npm run build
cd ..
echo "✓ React 빌드 완료"

# 5. 서버 재시작
echo ""
echo "[5/5] 서버 재시작 중..."
pm2 restart kw-church-api
echo "✓ 서버 재시작 완료"

echo ""
echo "=========================================="
echo "업데이트 완료!"
echo "=========================================="
echo ""
echo "서버 상태 확인:"
pm2 status

