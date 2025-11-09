const XLSX = require('xlsx');
const mysql = require('mysql2/promise');
const config = require('./config');
const path = require('path');
const fs = require('fs');

// Excel 파일 경로 (명령줄 인자로 받거나 기본값 사용)
const excelFilePath = process.argv[2] || 'KW교회 교적부-4.xlsx';

async function importExcelToDatabase() {
  let connection;
  
  try {
    // Excel 파일 존재 확인
    if (!fs.existsSync(excelFilePath)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${excelFilePath}`);
      console.log('\n사용법:');
      console.log('  node import-excel.js <Excel파일경로>');
      console.log('  예: node import-excel.js "KW교회 교적부-4.xlsx"');
      process.exit(1);
    }

    console.log(`📖 Excel 파일 읽는 중: ${excelFilePath}`);
    
    // Excel 파일 읽기
    const workbook = XLSX.readFile(excelFilePath, { type: 'file' });
    
    // 첫 번째 시트 가져오기
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`📊 시트 이름: ${sheetName}`);
    
    // JSON으로 변환
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      defval: '', // 빈 셀은 빈 문자열로
      raw: false  // 날짜를 문자열로 변환
    });
    
    console.log(`✅ ${data.length}개의 행을 읽었습니다.`);
    
    if (data.length === 0) {
      console.log('⚠️  데이터가 없습니다.');
      return;
    }
    
    // 데이터베이스 연결
    console.log('\n🔌 데이터베이스 연결 중...');
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database
    });
    
    console.log('✅ 데이터베이스 연결 성공\n');
    
    // Excel 컬럼명을 데이터베이스 컬럼명으로 매핑
    // Excel 파일의 실제 컬럼명에 맞게 수정됨
    const columnMapping = {
      '제적': 'dismissal_date',  // 제적 컬럼 (날짜가 있으면 비활성 처리)
      '성별': 'gender',
      '이름': 'name',
      '영문이름': 'english_name',
      '생년월일': 'birth_date',
      '전화번호': 'phone',
      '집 주소': 'address',
      '주소': 'address',  // 백업 매핑
      '이메일': 'email',
      '직업': 'occupation',
      '직장전화번호': 'work_phone',
      '거주 시작일자': 'residence_start_date',
      '거주시작일': 'residence_start_date',  // 백업 매핑
      '교회등록일': 'registration_date',
      '제적날짜': 'dismissal_date',  // 백업 매핑
      '소천여부': 'deceased',
      '결혼기념일': 'marriage_anniversary',
      '체류예정기간': 'stay_period',
      '학력': 'education',
      '사회경력': 'career',
      '특기': 'specialty',
      '봉사경력': 'service_history',
      '세례': 'baptized_type',
      '세례여부': 'baptized_type',  // 백업 매핑
      '유세': 'infant_baptism',
      '유아세례여부': 'infant_baptism',  // 백업 매핑
      '세례교회': 'baptism_church',
      '세례년도 ': 'baptism_year',  // 공백 포함
      '세례년도': 'baptism_year',  // 백업 매핑
      '세례목사': 'baptism_pastor',
      '섬기던 교회': 'previous_church',
      '섬기던교회': 'previous_church',  // 백업 매핑
      '전교회 직분': 'previous_office',
      '전교회직분': 'previous_office',  // 백업 매핑
      '신앙생활': 'faith_life',
      '신앙생활시작': 'faith_life',  // 백업 매핑
      '신앙세대주': 'faith_head',
      '심방날짜': 'visit_dates',
      '특이사항': 'notes',
      '활성여부': 'active'
    };
    
    // Excel 파일의 첫 번째 행 출력 (컬럼명 확인용)
    console.log('📋 Excel 파일의 컬럼명:');
    if (data.length > 0) {
      Object.keys(data[0]).forEach((key, index) => {
        console.log(`  ${index + 1}. ${key}`);
      });
    }
    console.log('\n');
    
    // 데이터 삽입
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Excel 데이터를 데이터베이스 형식으로 변환
        const memberData = {};
        
        // 매핑된 컬럼 처리
        Object.keys(columnMapping).forEach(excelCol => {
          const dbCol = columnMapping[excelCol];
          if (row[excelCol] !== undefined && row[excelCol] !== '') {
            let value = row[excelCol];
            
            // 날짜 형식 변환 (Excel 날짜는 숫자일 수 있음)
            if (dbCol.includes('date') || dbCol.includes('anniversary') || dbCol === 'birth_date') {
              // Excel 날짜는 1900-01-01부터의 일수
              if (typeof value === 'number') {
                const excelEpoch = new Date(1899, 11, 30);
                const date = new Date(excelEpoch.getTime() + value * 86400000);
                value = date.toISOString().split('T')[0];
              } else if (typeof value === 'string' && value.trim() !== '') {
                const dateStr = value.trim();
                
                // 형식 1: YYYY. MM. DD 또는 YYYY. M. D (예: '1944. 04. 29', '1945. 4. 29')
                let dateMatch = dateStr.match(/(\d{4})\s*\.\s*(\d{1,2})\s*\.\s*(\d{1,2})/);
                if (dateMatch) {
                  const [, year, month, day] = dateMatch;
                  value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                } else {
                  // 형식 2: YYYY-MM-DD 또는 YYYY/MM/DD
                  dateMatch = dateStr.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
                  if (dateMatch) {
                    const [, year, month, day] = dateMatch;
                    value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                  } else {
                    // 형식 3: YYYY만 있는 경우 (연도만) - 1월 1일로 설정
                    dateMatch = dateStr.match(/^(\d{4})$/);
                    if (dateMatch) {
                      const year = dateMatch[1];
                      // registration_date나 baptism_year 같은 경우는 연도만 허용
                      if (dbCol === 'registration_date' || dbCol === 'baptism_year') {
                        value = `${year}-01-01`;
                      } else {
                        // birth_date는 연도만 있으면 null로 처리 (부정확)
                        value = null;
                      }
                    } else {
                      // 형식 4: MM.DD (결혼기념일 등) - 현재 연도 사용
                      dateMatch = dateStr.match(/(\d{1,2})\s*\.\s*(\d{1,2})/);
                      if (dateMatch && dbCol === 'marriage_anniversary') {
                        const [, month, day] = dateMatch;
                        const currentYear = new Date().getFullYear();
                        value = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                      } else {
                        // 파싱 실패 시 null
                        value = null;
                      }
                    }
                  }
                }
              } else {
                value = null;
              }
            }
            
            // Boolean 필드 처리
            if (dbCol === 'active' || dbCol === 'deceased' || dbCol === 'infant_baptism') {
              value = value === true || value === 'TRUE' || value === 'true' || value === '1' || value === 1 || value === 'Y' || value === 'y' || value === '예' || value === '활성' || value === 'O' || value === 'o';
            }
            
            // 성별 변환 (M/F)
            if (dbCol === 'gender') {
              if (typeof value === 'string') {
                const genderStr = value.trim().toUpperCase();
                if (genderStr === '남' || genderStr === '남성' || genderStr === 'M' || genderStr === 'MALE') {
                  value = 'M';
                } else if (genderStr === '여' || genderStr === '여성' || genderStr === 'F' || genderStr === 'FEMALE') {
                  value = 'F';
                } else {
                  value = null; // 알 수 없는 값은 null
                }
              }
            }
            
            // 심방날짜 처리 (JSON 배열로 변환)
            if (dbCol === 'visit_dates') {
              if (value && typeof value === 'string' && value.trim() !== '') {
                // 쉼표로 구분된 날짜 문자열을 배열로 변환
                const dates = value.split(',').map(d => d.trim()).filter(d => d !== '');
                if (dates.length > 0) {
                  // 날짜 형식 검증 및 변환
                  const validDates = dates.map(dateStr => {
                    // Excel 날짜 형식 변환 시도
                    if (typeof dateStr === 'number') {
                      const excelEpoch = new Date(1899, 11, 30);
                      const date = new Date(excelEpoch.getTime() + dateStr * 86400000);
                      return date.toISOString().split('T')[0];
                    }
                    // 문자열 날짜 형식 변환
                    const dateMatch = dateStr.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
                    if (dateMatch) {
                      const [, year, month, day] = dateMatch;
                      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                    return dateStr; // 변환 실패 시 원본 반환
                  }).filter(d => d);
                  value = JSON.stringify(validDates);
                } else {
                  value = null;
                }
              } else {
                value = null;
              }
            }
            
            memberData[dbCol] = value;
          }
        });
        
        // 필수 필드 확인
        if (!memberData.name || memberData.name.trim() === '') {
          console.log(`⚠️  행 ${i + 2}: 이름이 없어 건너뜁니다.`);
          errorCount++;
          continue;
        }
        
        // 전화번호가 없으면 기본값 설정 (필수 필드이므로)
        if (!memberData.phone || memberData.phone.trim() === '') {
          memberData.phone = '000-0000-0000';  // 기본값 설정
        }
        
        // work_phone 길이 제한 (VARCHAR(20)이므로)
        if (memberData.work_phone && memberData.work_phone.length > 20) {
          memberData.work_phone = memberData.work_phone.substring(0, 20);
        }
        
        // 제적 날짜가 있으면 비활성 처리
        if (memberData.dismissal_date) {
          memberData.active = false;
          console.log(`ℹ️  행 ${i + 2}: 제적 날짜가 있어 비활성으로 설정합니다 (${memberData.name})`);
        } else {
          // 제적 날짜가 없으면 기본값으로 활성 설정
          if (memberData.active === undefined) {
            memberData.active = true;
          }
        }
        
        // 중복 확인 (이름과 전화번호로)
        const [existing] = await connection.execute(
          'SELECT id FROM members WHERE name = ? AND phone = ?',
          [memberData.name, memberData.phone]
        );
        
        if (existing.length > 0) {
          console.log(`⚠️  행 ${i + 2}: 이미 존재하는 성도입니다 (${memberData.name}, ${memberData.phone}). 건너뜁니다.`);
          errorCount++;
          continue;
        }
        
        // baptized 필드 자동 설정 (baptized_type이 있으면 true)
        if (memberData.baptized_type && !memberData.baptized) {
          memberData.baptized = true;
        }
        
        // INSERT 쿼리 생성 (모든 필수 및 선택 필드 포함)
        const allColumns = [
          'name', 'phone', 'address', 'gender', 'birth_date', 'baptized', 'baptized_type',
          'baptism_date', 'registration_date', 'dismissal_date', 'deceased', 'faith_head',
          'english_name', 'infant_baptism', 'email', 'occupation', 'work_phone',
          'residence_start_date', 'previous_address', 'previous_church', 'previous_office',
          'baptism_church', 'baptism_year', 'baptism_pastor', 'education', 'career',
          'faith_life', 'marriage_anniversary', 'stay_period', 'specialty', 'service_history',
          'active', 'visit_dates', 'notes'
        ];
        
        // memberData에 있는 컬럼만 필터링
        const columns = allColumns.filter(col => memberData.hasOwnProperty(col));
        const values = columns.map(col => memberData[col]);
        const placeholders = columns.map(() => '?').join(', ');
        
        const sql = `INSERT INTO members (${columns.join(', ')}) VALUES (${placeholders})`;
        
        await connection.execute(sql, values);
        successCount++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`진행 중... ${i + 1}/${data.length} 처리 완료`);
        }
        
      } catch (error) {
        errorCount++;
        errors.push({
          row: i + 2,
          name: row['이름'] || row['name'] || '알 수 없음',
          error: error.message
        });
        console.error(`❌ 행 ${i + 2} 오류: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 가져오기 결과:');
    console.log(`  ✅ 성공: ${successCount}개`);
    console.log(`  ❌ 실패: ${errorCount}개`);
    console.log(`  📝 전체: ${data.length}개`);
    
    if (errors.length > 0) {
      console.log('\n❌ 오류 상세:');
      errors.slice(0, 10).forEach(err => {
        console.log(`  행 ${err.row} (${err.name}): ${err.error}`);
      });
      if (errors.length > 10) {
        console.log(`  ... 외 ${errors.length - 10}개 오류`);
      }
    }
    
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 데이터베이스 연결 종료');
    }
  }
}

// 실행
importExcelToDatabase().catch(console.error);

