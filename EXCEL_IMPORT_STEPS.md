# list.xlsx를 데이터베이스에 입력하는 방법

## 전체 과정 요약

1. **list.xlsx 파일을 VM에 업로드**
2. **VM에 SSH 접속**
3. **import-excel.js 스크립트 실행**
4. **결과 확인**

---

## 단계별 상세 가이드

### 1단계: 파일을 VM에 업로드

#### 방법 A: SCP 사용 (SSH 키 필요)

```bash
# 기본 명령어
scp -i ~/.ssh/azure_vm_key.pem list.xlsx azureuser@20.151.51.203:~/kw-record2/list.xlsx

# SSH 키 파일 경로가 다른 경우
scp -i /path/to/your-key.pem list.xlsx azureuser@20.151.51.203:~/kw-record2/list.xlsx
```

#### 방법 B: 스크립트 사용

```bash
# SSH 키 경로 설정
export SSH_KEY=~/.ssh/azure_vm_key.pem

# 스크립트 실행
./upload-file-to-vm.sh list.xlsx
```

---

### 2단계: VM에 SSH 접속

```bash
# SSH 키를 사용하여 접속
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203

# 프로젝트 디렉토리로 이동
cd ~/kw-record2
```

---

### 3단계: Excel 파일을 데이터베이스에 입력

#### 기본 사용법

```bash
# list.xlsx 파일을 데이터베이스에 입력
node import-excel.js list.xlsx
```

#### 다른 파일명 사용

```bash
# 다른 이름의 Excel 파일 사용
node import-excel.js members.xlsx
node import-excel.js "KW교회 교적부-4.xlsx"
```

#### 절대 경로 사용

```bash
# 전체 경로 지정
node import-excel.js /home/azureuser/kw-record2/list.xlsx
```

---

### 4단계: 결과 확인

스크립트 실행 후 다음과 같은 결과가 표시됩니다:

```
📊 가져오기 결과:
  ✅ 성공: 150개
  ❌ 실패: 5개
  📝 전체: 155개
```

---

## 한 번에 실행하기 (원격 명령어)

파일 업로드와 데이터베이스 입력을 한 번에 실행:

```bash
# 1. 파일 업로드
scp -i ~/.ssh/azure_vm_key.pem list.xlsx azureuser@20.151.51.203:~/kw-record2/list.xlsx

# 2. 원격에서 스크립트 실행
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203 "cd ~/kw-record2 && node import-excel.js list.xlsx"
```

---

## 자동화 스크립트

한 번에 모든 작업을 수행하는 스크립트:

```bash
#!/bin/bash
# upload-and-import.sh

SSH_KEY="${SSH_KEY:-~/.ssh/azure_vm_key.pem}"
VM_IP="20.151.51.203"
VM_USER="azureuser"
LOCAL_FILE="${1:-list.xlsx}"

echo "📤 1단계: 파일 업로드 중..."
scp -i "$SSH_KEY" "$LOCAL_FILE" "$VM_USER@$VM_IP:~/kw-record2/list.xlsx"

if [ $? -eq 0 ]; then
    echo "✅ 파일 업로드 완료!"
    echo ""
    echo "📥 2단계: 데이터베이스에 입력 중..."
    ssh -i "$SSH_KEY" "$VM_USER@$VM_IP" "cd ~/kw-record2 && node import-excel.js list.xlsx"
else
    echo "❌ 파일 업로드 실패"
    exit 1
fi
```

사용법:
```bash
chmod +x upload-and-import.sh
./upload-and-import.sh list.xlsx
```

---

## 주의사항

### 1. 파일 형식
- Excel 파일 형식: `.xlsx` 또는 `.xls`
- 첫 번째 행은 컬럼명(헤더)이어야 합니다
- 필수 컬럼: `이름` (name)

### 2. 중복 처리
- 이름과 전화번호가 동일한 성도는 자동으로 건너뜁니다
- 중복을 무시하고 강제로 입력하려면 스크립트를 수정해야 합니다

### 3. 제적 날짜
- `제적` 또는 `제적날짜` 컬럼에 날짜가 있으면 자동으로 비활성(`active = false`) 처리됩니다

### 4. 전화번호
- 전화번호가 없으면 기본값 `000-0000-0000`으로 설정됩니다

---

## 문제 해결

### "파일을 찾을 수 없습니다" 오류

```bash
# VM에서 파일 확인
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203 "ls -lh ~/kw-record2/list.xlsx"

# 파일이 없으면 다시 업로드
scp -i ~/.ssh/azure_vm_key.pem list.xlsx azureuser@20.151.51.203:~/kw-record2/list.xlsx
```

### "데이터베이스 연결 오류"

```bash
# config.js 파일 확인
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203 "cat ~/kw-record2/config.js"

# 데이터베이스 서비스 확인
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203 "sudo systemctl status mysql"
```

### "컬럼명을 찾을 수 없습니다" 오류

스크립트 실행 시 Excel 파일의 컬럼명이 출력됩니다. 
`import-excel.js` 파일의 `columnMapping` 객체를 Excel 파일의 실제 컬럼명에 맞게 수정하세요.

---

## Excel 파일 컬럼명 확인

VM에서 Excel 파일의 컬럼명을 확인하려면:

```bash
# check-excel-columns.js 스크립트 사용
ssh -i ~/.ssh/azure_vm_key.pem azureuser@20.151.51.203 "cd ~/kw-record2 && node check-excel-columns.js list.xlsx"
```

이 스크립트는 Excel 파일의 모든 컬럼명과 샘플 데이터를 출력합니다.

