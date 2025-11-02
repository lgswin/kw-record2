#!/bin/bash
# Azure VM 초기 설정 스크립트
# 이 스크립트는 VM에 처음 접속했을 때 한 번만 실행합니다.

set -e  # 오류 발생 시 스크립트 중단

echo "=========================================="
echo "KW한인장로교회 관리 시스템 VM 설정 시작"
echo "=========================================="

# 1. 시스템 업데이트
echo ""
echo "[1/7] 시스템 업데이트 중..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git

# 2. MySQL 설치
echo ""
echo "[2/7] MySQL 설치 중..."
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

echo ""
echo "MySQL 설치 완료!"
echo "MySQL 서비스 상태:"
sudo systemctl status mysql --no-pager | head -3

# 3. MySQL root 비밀번호 설정
echo ""
echo "[3/7] MySQL root 비밀번호 설정 중..."
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'ads123';" 2>/dev/null || echo "비밀번호 설정 시도..."
sudo mysql -e "FLUSH PRIVILEGES;" 2>/dev/null || echo "권한 새로고침 시도..."

# 4. 데이터베이스 생성
echo ""
echo "[4/7] 데이터베이스 생성 중..."
mysql -u root -pads123 -e "CREATE DATABASE IF NOT EXISTS kwchurchdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo "데이터베이스 생성 실패. root 비밀번호 설정 후 수동으로 실행하세요:"
    echo "mysql -u root -pads123 -e \"CREATE DATABASE IF NOT EXISTS kwchurchdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
}

# 5. Node.js 설치
echo ""
echo "[5/7] Node.js 설치 중..."
echo "NodeSource 저장소 추가 중..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
echo "Node.js 설치 중..."
sudo apt-get install -y nodejs

echo ""
echo "Node.js 설치 완료!"
echo "설치된 버전:"
node --version
npm --version

if ! command -v node &> /dev/null; then
    echo "경고: Node.js 설치에 실패했습니다."
    echo "다시 시도하세요:"
    echo "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    echo "sudo apt-get install -y nodejs"
fi

# 6. PM2 설치
echo ""
echo "[6/7] PM2 설치 중..."
sudo npm install -g pm2

# 7. 방화벽 설정 (선택사항)
echo ""
echo "[7/7] 방화벽 설정 (선택사항)..."
read -p "VM 내부 방화벽(ufw)을 설정하시겠습니까? (y/N): " setup_firewall

if [[ "$setup_firewall" =~ ^[Yy]$ ]]; then
    echo "방화벽 설정 중..."
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 5001/tcp
    sudo ufw allow 3000/tcp
    sudo ufw --force enable
    
    echo ""
    echo "방화벽 상태:"
    sudo ufw status
    echo ""
    echo "⚠️  방화벽 설정 완료. 접속 문제가 발생하면 'sudo ufw disable' 명령어로 비활성화할 수 있습니다."
else
    echo "방화벽 설정을 건너뜁니다."
    echo "Azure NSG(Network Security Group)로 포트 관리를 권장합니다."
fi

# 8. 완료
echo ""
echo "=========================================="
echo "VM 초기 설정 완료!"
echo "=========================================="
echo ""
echo "설치 완료된 항목:"
echo "  ✓ 시스템 업데이트"
echo "  ✓ MySQL 서버 설치 및 시작"
echo "  ✓ MySQL root 비밀번호 설정 (ads123)"
echo "  ✓ kwchurchdb 데이터베이스 생성"
echo "  ✓ Node.js 설치"
echo "  ✓ PM2 설치"
if [[ "$setup_firewall" =~ ^[Yy]$ ]]; then
    echo "  ✓ 방화벽 설정"
else
    echo "  ⚠ 방화벽 설정 건너뜀 (Azure NSG 사용 권장)"
fi
echo ""
echo "다음 단계:"
echo ""
echo "1. MySQL 접속 테스트:"
echo "   mysql -u root -pads123"
echo ""
echo "2. GitHub 저장소 클론:"
echo "   cd ~"
echo "   git clone <your-github-repo-url> kw-record2"
echo "   cd kw-record2"
echo ""
echo "3. 프로젝트 설정 및 실행:"
echo "   npm install"
echo "   cd client && npm install && cd .."
echo "   mysql -u root -pads123 kwchurchdb < initi.sql"
echo "   cd client && npm run build && cd .."
echo "   pm2 start server.js --name kw-church-api --env production"
echo "   pm2 save"
echo ""

