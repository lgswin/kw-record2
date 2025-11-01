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

// 정적 파일 서빙 (React 빌드 파일 - 프로덕션용)
// 개발 환경에서는 React 개발 서버 사용 (포트 3000)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

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
    console.log('API 요청 받음: GET /api/members');
    const [rows] = await pool.execute('SELECT * FROM members ORDER BY created_at DESC');
    console.log('조회된 성도 수:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('성도 목록 조회 오류:', error);
    console.error('에러 상세:', error.message);
    console.error('스택:', error.stack);
    res.status(500).json({ error: '성도 목록을 가져올 수 없습니다.', details: error.message });
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
    const { name, phone, address, gender, birth_date, baptized, baptism_date, registration_date } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: '이름과 전화번호는 필수입니다.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO members (name, phone, address, gender, birth_date, baptized, baptism_date, registration_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, phone, address || null, gender || null, birth_date || null, baptized || false, baptism_date || null, registration_date || null]
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

// ==================== 가족 API ====================
// 모든 가족 조회
app.get('/api/families', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT f.*, 
        GROUP_CONCAT(m.name) as members
      FROM families f
      LEFT JOIN member_families mf ON f.id = mf.family_id
      LEFT JOIN members m ON mf.member_id = m.id
      GROUP BY f.id
      ORDER BY f.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('가족 목록 조회 오류:', error);
    res.status(500).json({ error: '가족 목록을 가져올 수 없습니다.' });
  }
});

// 새 가족 추가
app.post('/api/families', async (req, res) => {
  try {
    const { family_name, member_ids } = req.body;
    
    if (!family_name) {
      return res.status(400).json({ error: '가족명은 필수입니다.' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(
        'INSERT INTO families (family_name) VALUES (?)',
        [family_name]
      );
      
      const familyId = result.insertId;

      // 가족 구성원 추가
      if (member_ids && member_ids.length > 0) {
        for (const memberId of member_ids) {
          await connection.execute(
            'INSERT INTO member_families (member_id, family_id) VALUES (?, ?)',
            [memberId, familyId]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ 
        id: familyId, 
        family_name,
        message: '가족이 성공적으로 추가되었습니다.' 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('가족 추가 오류:', error);
    res.status(500).json({ error: '가족 추가에 실패했습니다.' });
  }
});

// 가족 삭제
app.delete('/api/families/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM families WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '가족을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '가족이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('가족 삭제 오류:', error);
    res.status(500).json({ error: '가족 삭제에 실패했습니다.' });
  }
});

// ==================== 순모임 API ====================
// 모든 순모임 조회
app.get('/api/parties', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT p.*, 
        m.name as leader_name,
        GROUP_CONCAT(DISTINCT m2.name) as members
      FROM parties p
      LEFT JOIN members m ON p.leader_id = m.id
      LEFT JOIN member_parties mp ON p.id = mp.party_id
      LEFT JOIN members m2 ON mp.member_id = m2.id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('순모임 목록 조회 오류:', error);
    res.status(500).json({ error: '순모임 목록을 가져올 수 없습니다.' });
  }
});

// 새 순모임 추가
app.post('/api/parties', async (req, res) => {
  try {
    const { party_name, leader_id, member_ids } = req.body;
    
    if (!party_name) {
      return res.status(400).json({ error: '순명은 필수입니다.' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(
        'INSERT INTO parties (party_name, leader_id) VALUES (?, ?)',
        [party_name, leader_id || null]
      );
      
      const partyId = result.insertId;

      // 순원 추가
      if (member_ids && member_ids.length > 0) {
        for (const memberId of member_ids) {
          await connection.execute(
            'INSERT INTO member_parties (member_id, party_id) VALUES (?, ?)',
            [memberId, partyId]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ 
        id: partyId, 
        party_name,
        message: '순모임이 성공적으로 추가되었습니다.' 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('순모임 추가 오류:', error);
    res.status(500).json({ error: '순모임 추가에 실패했습니다.' });
  }
});

// 순모임 삭제
app.delete('/api/parties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM parties WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '순모임을 찾을 수 없습니다.' });
    }
    
    res.json({ message: '순모임이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('순모임 삭제 오류:', error);
    res.status(500).json({ error: '순모임 삭제에 실패했습니다.' });
  }
});

// ==================== 부서 API ====================
// 모든 부서 조회
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT d.*, 
        m.name as leader_name,
        GROUP_CONCAT(DISTINCT m2.name) as members
      FROM departments d
      LEFT JOIN members m ON d.leader_id = m.id
      LEFT JOIN member_departments md ON d.id = md.department_id
      LEFT JOIN members m2 ON md.member_id = m2.id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('부서 목록 조회 오류:', error);
    res.status(500).json({ error: '부서 목록을 가져올 수 없습니다.' });
  }
});

// 새 부서 추가
app.post('/api/departments', async (req, res) => {
  try {
    const { department_name, leader_id, member_ids } = req.body;
    
    if (!department_name) {
      return res.status(400).json({ error: '부서명은 필수입니다.' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(
        'INSERT INTO departments (department_name, leader_id) VALUES (?, ?)',
        [department_name, leader_id || null]
      );
      
      const departmentId = result.insertId;

      // 부서원 추가
      if (member_ids && member_ids.length > 0) {
        for (const memberId of member_ids) {
          await connection.execute(
            'INSERT INTO member_departments (member_id, department_id) VALUES (?, ?)',
            [memberId, departmentId]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ 
        id: departmentId, 
        department_name,
        message: '부서가 성공적으로 추가되었습니다.' 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('부서 추가 오류:', error);
    res.status(500).json({ error: '부서 추가에 실패했습니다.' });
  }
});

// 부서 삭제
app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM departments WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '부서를 찾을 수 없습니다.' });
    }
    
    res.json({ message: '부서가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('부서 삭제 오류:', error);
    res.status(500).json({ error: '부서 삭제에 실패했습니다.' });
  }
});

// ==================== 직분 API ====================
// 모든 직분 조회
app.get('/api/offices', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM offices ORDER BY office_name');
    res.json(rows);
  } catch (error) {
    console.error('직분 목록 조회 오류:', error);
    res.status(500).json({ error: '직분 목록을 가져올 수 없습니다.' });
  }
});

// 새 직분 추가
app.post('/api/offices', async (req, res) => {
  try {
    const { office_name } = req.body;
    
    if (!office_name) {
      return res.status(400).json({ error: '직분명은 필수입니다.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO offices (office_name) VALUES (?)',
      [office_name]
    );
    
    res.status(201).json({ 
      id: result.insertId, 
      office_name,
      message: '직분이 성공적으로 추가되었습니다.' 
    });
  } catch (error) {
    console.error('직분 추가 오류:', error);
    res.status(500).json({ error: '직분 추가에 실패했습니다.' });
  }
});

// React 앱 서빙 (프로덕션 빌드만)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}에서 앱에 접속할 수 있습니다.`);
});

