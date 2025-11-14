#!/bin/bash
# Azure VM에 파일 업로드 스크립트

# 설정 (필요에 따라 수정)
VM_IP="20.151.51.203"
VM_USER="azureuser"
VM_PATH="~/kw-record2/list.xlsx"
SSH_KEY="${SSH_KEY:-~/.ssh/azure_vm_key.pem}"  # 기본값 또는 환경변수 사용

# 첫 번째 인자로 파일 경로 받기
LOCAL_FILE="${1:-list.xlsx}"

# SSH 키 파일 확인
if [ ! -f "$SSH_KEY" ]; then
    echo "❌ SSH 키 파일을 찾을 수 없습니다: $SSH_KEY"
    echo ""
    echo "SSH 키 파일 경로를 지정하세요:"
    echo "  방법 1: 환경변수로 지정"
    echo "    export SSH_KEY=~/path/to/your-key.pem"
    echo "    ./upload-file-to-vm.sh list.xlsx"
    echo ""
    echo "  방법 2: 스크립트 내에서 직접 지정"
    echo "    스크립트의 SSH_KEY 변수를 수정하세요"
    echo ""
    echo "  방법 3: 명령어에 직접 지정"
    echo "    scp -i ~/path/to/your-key.pem list.xlsx $VM_USER@$VM_IP:$VM_PATH"
    exit 1
fi

# SSH 키 파일 권한 확인 및 수정
if [ "$(stat -f %A "$SSH_KEY" 2>/dev/null || stat -c %a "$SSH_KEY" 2>/dev/null)" != "600" ] && [ "$(stat -f %A "$SSH_KEY" 2>/dev/null || stat -c %a "$SSH_KEY" 2>/dev/null)" != "400" ]; then
    echo "⚠️  SSH 키 파일 권한을 수정합니다..."
    chmod 600 "$SSH_KEY"
fi

# 파일이 존재하는지 확인
if [ ! -f "$LOCAL_FILE" ]; then
    echo "❌ 파일을 찾을 수 없습니다: $LOCAL_FILE"
    echo "현재 디렉토리에서 파일을 찾을 수 없습니다."
    echo ""
    echo "사용법:"
    echo "  ./upload-file-to-vm.sh <로컬파일경로>"
    echo "  예: ./upload-file-to-vm.sh list.xlsx"
    echo "  예: ./upload-file-to-vm.sh ~/Downloads/list.xlsx"
    exit 1
fi

echo "📤 파일 업로드 중..."
echo "  로컬 파일: $LOCAL_FILE"
echo "  VM 경로: $VM_USER@$VM_IP:$VM_PATH"
echo "  SSH 키: $SSH_KEY"
echo ""

# SCP로 파일 업로드 (SSH 키 사용)
scp -i "$SSH_KEY" "$LOCAL_FILE" "$VM_USER@$VM_IP:$VM_PATH"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 파일 업로드 완료!"
    echo ""
    echo "VM에서 다음 명령어로 확인하세요:"
    echo "  ssh -i $SSH_KEY $VM_USER@$VM_IP 'ls -lh ~/kw-record2/list.xlsx'"
    echo ""
    echo "Excel 파일 가져오기:"
    echo "  ssh -i $SSH_KEY $VM_USER@$VM_IP 'cd ~/kw-record2 && node import-excel.js list.xlsx'"
else
    echo ""
    echo "❌ 파일 업로드 실패"
    echo ""
    echo "문제 해결:"
    echo "  1. SSH 키 파일 경로 확인: $SSH_KEY"
    echo "  2. SSH 키 파일 권한 확인: chmod 600 $SSH_KEY"
    echo "  3. VM IP 주소 확인: $VM_IP"
    echo "  4. VM이 실행 중인지 확인"
    exit 1
fi

