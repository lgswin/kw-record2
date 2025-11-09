# Excel 파일 데이터베이스 가져오기 가이드

이 가이드는 Excel 파일(`KW교회 교적부-4.xlsx`)에서 데이터를 읽어서 MySQL 데이터베이스의 `members` 테이블로 가져오는 방법을 설명합니다.

## 📋 사전 준비

### 1. xlsx 패키지 설치

```bash
npm install xlsx
```

### 2. Excel 파일 준비

- Excel 파일을 프로젝트 루트 디렉토리에 위치시키세요
- 파일명: `KW교회 교적부-4.xlsx` (또는 다른 이름 사용 가능)
- 첫 번째 행은 컬럼명(헤더)이어야 합니다

## 🚀 사용 방법

### 기본 사용법

```bash
node import-excel.js
```

기본적으로 `KW교회 교적부-4.xlsx` 파일을 찾습니다.

### 다른 파일명 사용

```bash
node import-excel.js "파일명.xlsx"
```

예:
```bash
node import-excel.js "KW교회 교적부-4.xlsx"
node import-excel.js "/path/to/your/file.xlsx"
```

## 📊 Excel 파일 형식

### 지원하는 컬럼명

스크립트는 다음 컬럼명을 인식합니다 (대소문자 구분 없음):

**기본 정보:**
- `이름` → `name` (필수)
- `영문이름` → `english_name`
- `전화번호` → `phone`
- `이메일` → `email`
- `생년월일` → `birth_date`
- `주소` → `address`
- `거주시작일` → `residence_start_date`
- `교회등록일` → `registration_date`

**상세 정보:**
- `직업` → `occupation`
- `직장번호` → `work_phone`
- `결혼기념일` → `marriage_anniversary`
- `전 거주지` → `previous_address`
- `체류예정기간` → `stay_period`
- `학력` → `education`
- `사회경력` → `career`
- `특기` → `specialty`
- `봉사경력` → `service_history`

**신앙 정보:**
- `세례 여부` → `baptized_type`
- `유아세례 여부` → `infant_baptism`
- `세례교회` → `baptism_church`
- `세례년도` → `baptism_year`
- `세례 목사` → `baptism_pastor`
- `섬기던교회` → `previous_church`
- `전교회직분` → `previous_office`
- `신앙생활시작` → `faith_life`
- `신앙세대주` → `faith_head`

**기타:**
- `활성 여부` → `active`
- `특이사항` → `notes`

### Excel 파일 예시

| 이름 | 영문이름 | 전화번호 | 이메일 | 생년월일 | 주소 | ... |
|------|----------|----------|--------|----------|------|-----|
| 홍길동 | Hong Gildong | 010-1234-5678 | hong@example.com | 1980-01-01 | 서울시 강남구 ... | ... |

## ⚙️ 동작 방식

1. **Excel 파일 읽기**: 첫 번째 시트를 읽습니다
2. **데이터 변환**: 
   - 날짜 형식 자동 변환 (Excel 날짜 → YYYY-MM-DD)
   - Boolean 값 변환 (TRUE/예/활성 → true)
3. **중복 확인**: 이름과 전화번호로 중복 체크
4. **데이터 삽입**: 중복이 아닌 경우에만 데이터베이스에 삽입

## 📝 주의사항

### 필수 필드
- **이름**은 반드시 있어야 합니다. 이름이 없는 행은 건너뜁니다.

### 중복 처리
- 이름과 전화번호가 동일한 성도가 이미 존재하면 건너뜁니다.
- 중복을 무시하고 강제로 삽입하려면 스크립트를 수정해야 합니다.

### 날짜 형식
- Excel 날짜는 자동으로 `YYYY-MM-DD` 형식으로 변환됩니다.
- 문자열 날짜도 자동으로 파싱을 시도합니다.

### Boolean 필드
다음 값들은 `true`로 변환됩니다:
- `TRUE`, `true`, `1`, `Y`, `y`, `예`, `활성`

## 🔧 문제 해결

### "파일을 찾을 수 없습니다" 오류

```bash
# 파일 경로 확인
ls -la "KW교회 교적부-4.xlsx"

# 절대 경로 사용
node import-excel.js "/Users/gslee/Documents/kw-record2/KW교회 교적부-4.xlsx"
```

### "컬럼명을 찾을 수 없습니다" 오류

스크립트를 실행하면 Excel 파일의 컬럼명이 출력됩니다. 
`import-excel.js` 파일의 `columnMapping` 객체를 Excel 파일의 실제 컬럼명에 맞게 수정하세요.

예:
```javascript
const columnMapping = {
  '실제Excel컬럼명1': 'name',
  '실제Excel컬럼명2': 'phone',
  // ...
};
```

### 데이터베이스 연결 오류

`config.js` 파일의 데이터베이스 설정을 확인하세요:
```javascript
module.exports = {
  database: {
    host: 'localhost',
    user: 'root',
    password: 'ads123',
    database: 'kwchurchdb'
  }
};
```

### 날짜 형식 오류

Excel에서 날짜를 텍스트 형식으로 저장하거나, `YYYY-MM-DD` 형식으로 입력하세요.

## 📊 실행 결과 예시

```
📖 Excel 파일 읽는 중: KW교회 교적부-4.xlsx
📊 시트 이름: Sheet1
✅ 150개의 행을 읽었습니다.

🔌 데이터베이스 연결 중...
✅ 데이터베이스 연결 성공

📋 Excel 파일의 컬럼명:
  1. 이름
  2. 영문이름
  3. 전화번호
  ...

진행 중... 10/150 처리 완료
진행 중... 20/150 처리 완료
...

==================================================
📊 가져오기 결과:
  ✅ 성공: 145개
  ❌ 실패: 5개
  📝 전체: 150개
==================================================

🔌 데이터베이스 연결 종료
```

## 🔄 스크립트 수정

컬럼명 매핑을 변경하려면 `import-excel.js` 파일의 `columnMapping` 객체를 수정하세요:

```javascript
const columnMapping = {
  'Excel컬럼명': '데이터베이스컬럼명',
  // ...
};
```

## 💡 팁

1. **백업**: 가져오기 전에 데이터베이스를 백업하세요
2. **테스트**: 소량의 데이터로 먼저 테스트하세요
3. **로그 확인**: 실행 결과를 확인하여 오류가 있는지 체크하세요
4. **중복 확인**: 가져오기 후 웹 인터페이스에서 중복 데이터를 확인하세요

