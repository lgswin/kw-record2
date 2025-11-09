const XLSX = require('xlsx');
const fs = require('fs');

// Excel 파일 경로 (명령줄 인자로 받거나 기본값 사용)
const excelFilePath = process.argv[2] || 'KW교회 교적부-4.xlsx';

function checkExcelColumns() {
  try {
    // Excel 파일 존재 확인
    if (!fs.existsSync(excelFilePath)) {
      console.error(`❌ 파일을 찾을 수 없습니다: ${excelFilePath}`);
      console.log('\n사용법:');
      console.log('  node check-excel-columns.js <Excel파일경로>');
      process.exit(1);
    }

    console.log(`📖 Excel 파일 읽는 중: ${excelFilePath}\n`);
    
    // Excel 파일 읽기
    const workbook = XLSX.readFile(excelFilePath, { type: 'file' });
    
    // 모든 시트 정보 출력
    console.log('📊 시트 목록:');
    workbook.SheetNames.forEach((name, index) => {
      console.log(`  ${index + 1}. ${name}`);
    });
    console.log('');
    
    // 첫 번째 시트 가져오기
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    console.log(`📋 시트 "${sheetName}"의 컬럼명:\n`);
    
    // JSON으로 변환
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      defval: '', 
      raw: false,
      header: 1  // 첫 번째 행을 배열로 가져오기
    });
    
    if (data.length === 0) {
      console.log('⚠️  데이터가 없습니다.');
      return;
    }
    
    // 첫 번째 행 (헤더) 출력
    const headers = data[0];
    console.log('컬럼명 목록:');
    headers.forEach((header, index) => {
      console.log(`  ${index + 1}. "${header}"`);
    });
    
    // 샘플 데이터 출력 (최대 3개 행)
    console.log('\n📝 샘플 데이터 (최대 3개 행):\n');
    const sampleData = XLSX.utils.sheet_to_json(worksheet, { 
      defval: '', 
      raw: false 
    });
    
    sampleData.slice(0, 3).forEach((row, index) => {
      console.log(`행 ${index + 1}:`);
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (value && value.toString().trim() !== '') {
          console.log(`  ${key}: ${value}`);
        }
      });
      console.log('');
    });
    
    console.log(`\n✅ 총 ${sampleData.length}개의 데이터 행이 있습니다.`);
    
    // 매핑 제안
    console.log('\n💡 import-excel.js의 columnMapping에 추가할 수 있는 예시:');
    console.log('const columnMapping = {');
    headers.forEach(header => {
      if (header && header.trim() !== '') {
        // 간단한 매핑 제안 (실제로는 수동으로 확인 필요)
        const suggestedKey = header.trim();
        console.log(`  '${suggestedKey}': 'db_column_name',  // 수정 필요`);
      }
    });
    console.log('};');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

// 실행
checkExcelColumns();

