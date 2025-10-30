const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 서빙 (React 빌드 파일)
app.use(express.static(path.join(__dirname, 'client/build')));

// 데이터베이스 연결 풀 생성
const pool = mysql.createPool({
  host: process.env.DB_HOST || config.database.host,
  user: process.env.DB_USER || config.database.user,
  password: process.env.DB_PASSWORD || config.database.password,
  database: process.env.DB_NAME || config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 모든 성도 조회
app.get('/api/members', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM members ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('성도 목록 조회 오류:', error);
    res.status(500).json({ error: '성도 목록을 가져올 수 없습니다.' });
  }
});

// 특정 성도 조회
app.get('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM members WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: '성도를 찾을 수 없습니다.' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('성도 조회 오류:', error);
    res.status(500).json({ error: '성도 정보를 가져올 수 없습니다.' });
  }
});

// 새 성도 추가
app.post('/api/members', async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: '이름과 전화번호는 필수입니다.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO members (name, phone) VALUES (?, ?)',
      [name, phone]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      name, 
      phone,
      message: '성도가 성공적으로 추가되었습니다.' 
    });
  } catch (error) {
    console.error('성도 추가 오류:', error);
    res.status(500).json({ error: '성도 추가에 실패했습니다.' });
  }
});

// 성도 정보 수정
app.put('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: '이름과 전화번호는 필수입니다.' });
    }

    const [result] = await pool.execute(
      'UPDATE members SET name = ?, phone = ? WHERE id = ?',
      [name, phone, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '성도를 찾을 수 없습니다.' });
    }
    
    res.json({ 
      id: parseInt(id), 
      name, 
      phone,
      message: '성도 정보가 성공적으로 수정되었습니다.' 
    });
  } catch (error) {
    console.error('성도 수정 오류:', error);
    res.status(500).json({ error: '성도 정보 수정에 실패했습니다.' });
  }
});

// 성도 삭제
app.delete('/api/members/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute('DELETE FROM members WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '성도를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '성도가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('성도 삭제 오류:', error);
    res.status(500).json({ error: '성도 삭제에 실패했습니다.' });
  }
});

// React 앱 서빙 (프로덕션 빌드)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}에서 앱에 접속할 수 있습니다.`);
});

