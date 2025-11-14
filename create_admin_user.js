// 기본 관리자 계정 생성 스크립트
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('./config');

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
  });

  try {
    // 기본 관리자 계정 정보
    const username = 'admin';
    const password = 'admin123'; // 기본 비밀번호 (실제 사용 시 변경 필요)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 기존 사용자 확인
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      console.log('기본 관리자 계정이 이미 존재합니다.');
      // 비밀번호 업데이트
      await connection.execute(
        'UPDATE users SET password = ?, role = "admin", active = TRUE WHERE username = ?',
        [hashedPassword, username]
      );
      console.log('기본 관리자 계정 비밀번호가 업데이트되었습니다.');
    } else {
      // 새 관리자 계정 생성
      await connection.execute(
        'INSERT INTO users (username, password, role, name) VALUES (?, ?, "admin", "관리자")',
        [username, hashedPassword]
      );
      console.log('기본 관리자 계정이 생성되었습니다.');
    }

    console.log('\n=== 기본 관리자 계정 정보 ===');
    console.log('사용자명: admin');
    console.log('비밀번호: admin123');
    console.log('권한: admin');
    console.log('\n⚠️  보안을 위해 로그인 후 비밀번호를 변경하세요!');
  } catch (error) {
    console.error('관리자 계정 생성 오류:', error);
  } finally {
    await connection.end();
  }
}

createAdminUser();

