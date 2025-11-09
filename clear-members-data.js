const mysql = require('mysql2/promise');
const config = require('./config');

async function clearMembersData() {
  let connection;
  
  try {
    console.log('🔌 데이터베이스 연결 중...');
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database
    });
    
    console.log('✅ 데이터베이스 연결 성공\n');
    
    // 기존 데이터 개수 확인
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM members');
    const currentCount = countResult[0].count;
    
    console.log(`📊 현재 members 테이블에 ${currentCount}개의 데이터가 있습니다.`);
    
    if (currentCount === 0) {
      console.log('✅ 삭제할 데이터가 없습니다.');
      return;
    }
    
    // 확인 메시지
    console.log(`\n⚠️  경고: members 테이블의 모든 데이터를 삭제합니다.`);
    console.log(`   이 작업은 되돌릴 수 없습니다!\n`);
    
    // 실제 삭제
    const [result] = await connection.execute('DELETE FROM members');
    
    console.log(`✅ ${result.affectedRows}개의 데이터가 삭제되었습니다.`);
    
    // 삭제 후 개수 확인
    const [newCountResult] = await connection.execute('SELECT COUNT(*) as count FROM members');
    const newCount = newCountResult[0].count;
    
    console.log(`📊 현재 members 테이블에 ${newCount}개의 데이터가 있습니다.`);
    
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
clearMembersData().catch(console.error);

