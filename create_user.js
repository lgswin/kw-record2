// 새 사용자 생성 스크립트
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const config = require('./config');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createUser() {
  const connection = await mysql.createConnection({
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
  });

  try {
    console.log('=== 새 사용자 생성 ===\n');

    // 사용자 정보 입력
    const username = await question('사용자명 (username): ');
    if (!username.trim()) {
      console.log('❌ 사용자명은 필수입니다.');
      process.exit(1);
    }

    const password = await question('비밀번호 (password): ');
    if (!password.trim()) {
      console.log('❌ 비밀번호는 필수입니다.');
      process.exit(1);
    }

    const roleInput = await question('권한 (admin/user) [기본값: user]: ');
    const role = roleInput.trim() || 'user';
    if (role !== 'admin' && role !== 'user') {
      console.log('❌ 권한은 admin 또는 user만 가능합니다.');
      process.exit(1);
    }

    const name = await question('이름 (선택사항): ');
    const email = await question('이메일 (선택사항): ');

    // 중복 확인
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      console.log('❌ 이미 존재하는 사용자명입니다.');
      process.exit(1);
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const [result] = await connection.execute(
      'INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, role, name.trim() || null, email.trim() || null]
    );

    console.log('\n✅ 사용자가 성공적으로 생성되었습니다!');
    console.log('\n=== 생성된 사용자 정보 ===');
    console.log(`ID: ${result.insertId}`);
    console.log(`사용자명: ${username}`);
    console.log(`권한: ${role}`);
    console.log(`이름: ${name.trim() || '-'}`);
    console.log(`이메일: ${email.trim() || '-'}`);
    console.log('\n⚠️  보안을 위해 로그인 후 비밀번호를 변경하세요!');

  } catch (error) {
    console.error('❌ 사용자 생성 오류:', error);
    process.exit(1);
  } finally {
    await connection.end();
    rl.close();
  }
}

createUser();

