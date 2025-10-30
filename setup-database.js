const mysql = require('mysql2/promise');
const config = require('./config');

async function setupDatabase() {
  let connection;
  
  try {
    // MySQL 서버에 연결 (데이터베이스 지정 없이)
    connection = await mysql.createConnection({
      host: config.database.host,
      user: config.database.user,
      password: config.database.password
    });

    console.log('MySQL 서버에 연결되었습니다.');

    // 데이터베이스 생성
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database.database}`);
    console.log(`데이터베이스 '${config.database.database}'가 생성되었습니다.`);

    // 생성된 데이터베이스 사용
    await connection.execute(`USE ${config.database.database}`);

    // members 테이블 생성
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;

    await connection.execute(createTableQuery);
    console.log('members 테이블이 생성되었습니다.');

    // 샘플 데이터 삽입 (선택사항)
    const sampleData = [
      ['김성도', '010-1234-5678'],
      ['이교인', '010-2345-6789'],
      ['박신자', '010-3456-7890']
    ];

    for (const [name, phone] of sampleData) {
      await connection.execute(
        'INSERT IGNORE INTO members (name, phone) VALUES (?, ?)',
        [name, phone]
      );
    }
    console.log('샘플 데이터가 삽입되었습니다.');

  } catch (error) {
    console.error('데이터베이스 설정 중 오류 발생:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('데이터베이스 연결이 종료되었습니다.');
    }
  }
}

setupDatabase();

