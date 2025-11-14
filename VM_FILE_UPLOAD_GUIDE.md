# Azure VM에 파일 업로드 가이드

Azure VM에 `list.xlsx` 파일을 업로드하는 여러 방법을 안내합니다.

## 방법 1: SCP 사용 (SSH 키 필요)

### 기본 명령어 (SSH 키 사용)

```bash
scp -i ~/.ssh/azure_vm_key.pem list.xlsx azureuser@20.151.51.203:~/kw-record2/list.xlsx
```

**중요**: Azure VM에 접속하려면 SSH 키 파일(.pem)이 필요합니다.

### 사용 예시

```bash
# 현재 디렉토리의 list.xlsx 업로드 (SSH 키 사용)
scp -i ~/.ssh/azure_vm_key.pem list.xlsx azureuser@20.151.51.203:~/kw-record2/list.xlsx

# 다른 경로의 파일 업로드
scp -i ~/.ssh/azure_vm_key.pem ~/Downloads/list.xlsx azureuser@20.151.51.203:~/kw-record2/list.xlsx

# 다른 이름으로 업로드
scp -i ~/.ssh/azure_vm_key.pem list.xlsx azureuser@20.151.51.203:~/kw-record2/members.xlsx

# SSH 키 파일 경로가 다른 경우
scp -i /path/to/your-key.pem list.xlsx azureuser@20.151.51.203:~/kw-record2/list.xlsx
```

### SSH 키 파일 권한 설정

SSH 키 파일의 권한이 올바르지 않으면 오류가 발생할 수 있습니다:

```bash
# SSH 키 파일 권한 설정 (읽기 전용)
chmod 600 ~/.ssh/azure_vm_key.pem

# 또는
chmod 400 ~/.ssh/azure_vm_key.pem
```

### 스크립트 사용

```bash
# 스크립트에 실행 권한 부여 (한 번만)
chmod +x upload-file-to-vm.sh

# 파일 업로드
./upload-file-to-vm.sh list.xlsx
```

## 방법 2: SFTP 사용 (SSH 키 필요)

```bash
# SFTP 연결 (SSH 키 사용)
sftp -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203

# SFTP 명령어
cd ~/kw-record2
put list.xlsx
exit
```

## 방법 3: SSH로 직접 복사 (SSH 키 필요)

```bash
# 로컬에서 파일 내용을 읽어서 VM에 쓰기
cat list.xlsx | ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203 "cat > ~/kw-record2/list.xlsx"
```

## 방법 4: Azure Portal 사용

1. Azure Portal에 로그인
2. Virtual Machine 선택
3. "Connect" → "Bastion" 또는 "RDP" 사용
4. 파일을 드래그 앤 드롭하거나 복사

## 업로드 후 확인

VM에 SSH로 접속하여 파일 확인:

```bash
# SSH 키를 사용하여 접속
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203
cd ~/kw-record2
ls -lh list.xlsx
```

또는 원격 명령어로 확인:

```bash
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203 "ls -lh ~/kw-record2/list.xlsx"
```

## 업로드 후 Excel 파일 가져오기

파일을 업로드한 후, VM에서 다음 명령어로 데이터베이스에 가져오기:

```bash
# SSH로 접속
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203
cd ~/kw-record2
node import-excel.js list.xlsx
```

또는 원격 명령어로 실행:

```bash
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203 "cd ~/kw-record2 && node import-excel.js list.xlsx"
```

## 문제 해결

### "Permission denied" 오류

```bash
# VM에서 디렉토리 권한 확인
ssh azureuser@20.151.51.203 "chmod 755 ~/kw-record2"
```

### "Connection refused" 오류

- VM이 실행 중인지 확인
- 방화벽 규칙 확인 (SSH 포트 22 열려있는지)
- 네트워크 보안 그룹(NSG) 확인

### 파일 크기 제한

큰 파일의 경우:

```bash
# 압축 후 업로드
zip list.zip list.xlsx
scp list.zip azureuser@20.151.51.203:~/kw-record2/
ssh azureuser@20.151.51.203 "cd ~/kw-record2 && unzip list.zip"
```

