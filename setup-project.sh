#!/bin/bash
# 프로젝트 설정 및 실행 스크립트
# 프로젝트 파일이 이미 업로드된 후 실행합니다.

set -e

echo "=========================================="
echo "프로젝트 설정 시작"
echo "=========================================="

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
    echo "오류: 프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

# 1. 의존성 설치
echo ""
echo "[1/4] 의존성 설치 중..."
npm install

echo ""
echo "[2/4] 클라이언트 의존성 설치 중..."
cd client
npm install
cd ..

# 2. 데이터베이스 초기화
echo ""
echo "[3/4] 데이터베이스 초기화 중..."
if [ -f "initi.sql" ]; then
    mysql -u root -pads123 kwchurchdb < initi.sql
    echo "데이터베이스 초기화 완료!"
else
    echo "경고: initi.sql 파일을 찾을 수 없습니다."
    echo "수동으로 실행하세요: mysql -u root -pads123 kwchurchdb < initi.sql"
fi

# 3. React 빌드
echo ""
echo "[4/4] React 프로덕션 빌드 중..."
cd client
npm run build
cd ..

echo ""
echo "=========================================="
echo "프로젝트 설정 완료!"
echo "=========================================="
echo ""
echo "다음 단계:"
echo ""
echo "개발 모드로 실행:"
echo "  터미널 1: npm run dev"
echo "  터미널 2: npm run client"
echo ""
echo "프로덕션 모드로 실행:"
echo "  NODE_ENV=production node server.js"
echo ""
echo "PM2로 백그라운드 실행 (권장):"
echo "  pm2 start server.js --name kw-church-api --env production"
echo "  pm2 save"
echo "  pm2 startup"
echo ""

