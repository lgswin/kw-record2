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
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 모든 성도 조회 (관계 정보 포함)
app.get('/api/members', async (req, res) => {
  try {
    console.log('API 요청 받음: GET /api/members');
    const [members] = await pool.execute('SELECT * FROM members ORDER BY created_at DESC');
    
    // 각 성도의 관계 정보 조회
    for (let member of members) {
      // visit_dates JSON 파싱
      if (member.visit_dates) {
        try {
          if (typeof member.visit_dates === 'string') {
            member.visit_dates = JSON.parse(member.visit_dates);
          }
        } catch (e) {
          console.error('visit_dates 파싱 오류:', e);
          member.visit_dates = [];
        }
      } else {
        member.visit_dates = [];
      }
      
      // 직분 조회
      const [offices] = await pool.execute(
        'SELECT o.id, o.office_name FROM member_offices mo JOIN offices o ON mo.office_id = o.id WHERE mo.member_id = ?',
        [member.id]
      );
      member.offices = offices;
      
      // 가족 조회
      const [families] = await pool.execute(
        'SELECT f.id, f.family_name FROM member_families mf JOIN families f ON mf.family_id = f.id WHERE mf.member_id = ?',
        [member.id]
      );
      member.families = families;
      
      // 순모임 조회
      const [parties] = await pool.execute(
        'SELECT p.id, p.party_name FROM member_parties mp JOIN parties p ON mp.party_id = p.id WHERE mp.member_id = ?',
        [member.id]
      );
      member.parties = parties;
      
      // 부서 조회
      const [departments] = await pool.execute(
        'SELECT d.id, d.department_name FROM member_departments md JOIN departments d ON md.department_id = d.id WHERE md.member_id = ?',
        [member.id]
      );
      member.departments = departments;
    }
    
    console.log('조회된 성도 수:', members.length);
    res.json(members);
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
    
    const member = rows[0];
    
    // visit_dates JSON 파싱
    if (member.visit_dates) {
      try {
        if (typeof member.visit_dates === 'string') {
          member.visit_dates = JSON.parse(member.visit_dates);
        }
      } catch (e) {
        console.error('visit_dates 파싱 오류:', e);
        member.visit_dates = [];
      }
    } else {
      member.visit_dates = [];
    }
    
    res.json(member);
  } catch (error) {
    console.error('성도 조회 오류:', error);
    res.status(500).json({ error: '성도 정보를 가져올 수 없습니다.' });
  }
});

// 새 성도 추가
app.post('/api/members', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { name, phone, address, gender, birth_date, baptized, baptized_type, baptism_date, registration_date, 
            office_ids, family_ids, party_ids, department_ids, active, visit_dates, notes } = req.body;
    
    if (!name || !phone) {
      return res.status(400).json({ error: '이름과 전화번호는 필수입니다.' });
    }

    // 성도 추가
    const visitDatesJson = visit_dates && Array.isArray(visit_dates) ? JSON.stringify(visit_dates) : null;
    const [result] = await connection.execute(
      `INSERT INTO members (name, phone, address, gender, birth_date, baptized, baptized_type, baptism_date, registration_date,
        dismissal_date, deceased, faith_head, english_name, infant_baptism, email, occupation, work_phone,
        residence_start_date, previous_address, previous_church, previous_office, baptism_church, baptism_year,
        baptism_pastor, education, career, faith_life, marriage_anniversary, stay_period, specialty, service_history,
        active, visit_dates, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, phone, address || null, gender || null, birth_date || null, baptized || false, baptized_type || null, 
       baptism_date || null, registration_date || null, dismissal_date || null, deceased || false, faith_head || null,
       english_name || null, infant_baptism || false, email || null, occupation || null, work_phone || null,
       residence_start_date || null, previous_address || null, previous_church || null, previous_office || null,
       baptism_church || null, baptism_year || null, baptism_pastor || null, education || null, career || null,
       faith_life || null, marriage_anniversary || null, stay_period || null, specialty || null, service_history || null,
       active !== undefined ? active : true, visitDatesJson, notes || null]
    );
    
    const memberId = result.insertId;

    // 직분 관계 추가
    if (office_ids && Array.isArray(office_ids) && office_ids.length > 0) {
      for (const officeId of office_ids) {
        await connection.execute(
          'INSERT IGNORE INTO member_offices (member_id, office_id) VALUES (?, ?)',
          [memberId, officeId]
        );
      }
    }

    // 가족 관계 추가
    if (family_ids && Array.isArray(family_ids) && family_ids.length > 0) {
      for (const familyId of family_ids) {
        await connection.execute(
          'INSERT IGNORE INTO member_families (member_id, family_id) VALUES (?, ?)',
          [memberId, familyId]
        );
      }
    }

    // 순모임 관계 추가
    if (party_ids && Array.isArray(party_ids) && party_ids.length > 0) {
      for (const partyId of party_ids) {
        await connection.execute(
          'INSERT IGNORE INTO member_parties (member_id, party_id) VALUES (?, ?)',
          [memberId, partyId]
        );
      }
    }

    // 부서 관계 추가
    if (department_ids && Array.isArray(department_ids) && department_ids.length > 0) {
      for (const departmentId of department_ids) {
        await connection.execute(
          'INSERT IGNORE INTO member_departments (member_id, department_id) VALUES (?, ?)',
          [memberId, departmentId]
        );
      }
    }

    await connection.commit();
    
    res.status(201).json({ 
      id: memberId, 
      name, 
      phone,
      message: '성도가 성공적으로 추가되었습니다.' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('성도 추가 오류:', error);
    res.status(500).json({ error: '성도 추가에 실패했습니다.' });
  } finally {
    connection.release();
  }
});

// 성도 정보 수정
app.put('/api/members/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { name, phone, address, gender, birth_date, baptized, baptized_type, baptism_date, registration_date,
            dismissal_date, deceased, faith_head, english_name, infant_baptism, email, occupation, work_phone,
            residence_start_date, previous_address, previous_church, previous_office, baptism_church, baptism_year,
            baptism_pastor, education, career, faith_life, marriage_anniversary, stay_period, specialty, service_history,
            office_ids, family_ids, party_ids, department_ids, active, visit_dates, notes } = req.body;
    
    console.log('성도 수정 요청:', { id, name, phone });
    console.log('수정할 데이터:', { 
      address, gender, birth_date, baptized_type, email, occupation,
      active, visit_dates: visit_dates?.length || 0, notes: notes?.substring(0, 50) || ''
    });
    
    if (!name || !phone) {
      await connection.rollback();
      return res.status(400).json({ error: '이름과 전화번호는 필수입니다.' });
    }

    // 성도 기본 정보 수정
    const visitDatesJson = visit_dates && Array.isArray(visit_dates) ? JSON.stringify(visit_dates) : null;
    const updateParams = [
      name, phone, address || null, gender || null, birth_date || null, baptized || false, baptized_type || null, 
      baptism_date || null, registration_date || null, dismissal_date || null, deceased || false, faith_head || null,
      english_name || null, infant_baptism || false, email || null, occupation || null, work_phone || null,
      residence_start_date || null, previous_address || null, previous_church || null, previous_office || null,
      baptism_church || null, baptism_year || null, baptism_pastor || null, education || null, career || null,
      faith_life || null, marriage_anniversary || null, stay_period || null, specialty || null, service_history || null,
      active !== undefined ? active : true, visitDatesJson, notes || null, id
    ];
    
    const [result] = await connection.execute(
      `UPDATE members SET name = ?, phone = ?, address = ?, gender = ?, birth_date = ?, baptized = ?, baptized_type = ?, 
       baptism_date = ?, registration_date = ?, dismissal_date = ?, deceased = ?, faith_head = ?, english_name = ?, 
       infant_baptism = ?, email = ?, occupation = ?, work_phone = ?, residence_start_date = ?, previous_address = ?, 
       previous_church = ?, previous_office = ?, baptism_church = ?, baptism_year = ?, baptism_pastor = ?, 
       education = ?, career = ?, faith_life = ?, marriage_anniversary = ?, stay_period = ?, specialty = ?, 
       service_history = ?, active = ?, visit_dates = ?, notes = ? WHERE id = ?`,
      updateParams
    );
    
    console.log('UPDATE 결과:', { affectedRows: result.affectedRows });
    
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: '성도를 찾을 수 없습니다.' });
    }

    // 기존 관계 삭제
    await connection.execute('DELETE FROM member_offices WHERE member_id = ?', [id]);
    await connection.execute('DELETE FROM member_families WHERE member_id = ?', [id]);
    await connection.execute('DELETE FROM member_parties WHERE member_id = ?', [id]);
    await connection.execute('DELETE FROM member_departments WHERE member_id = ?', [id]);

    // 새로운 관계 추가
    if (office_ids && Array.isArray(office_ids) && office_ids.length > 0) {
      for (const officeId of office_ids) {
        await connection.execute(
          'INSERT INTO member_offices (member_id, office_id) VALUES (?, ?)',
          [id, officeId]
        );
      }
    }

    if (family_ids && Array.isArray(family_ids) && family_ids.length > 0) {
      for (const familyId of family_ids) {
        await connection.execute(
          'INSERT INTO member_families (member_id, family_id) VALUES (?, ?)',
          [id, familyId]
        );
      }
    }

    if (party_ids && Array.isArray(party_ids) && party_ids.length > 0) {
      for (const partyId of party_ids) {
        await connection.execute(
          'INSERT INTO member_parties (member_id, party_id) VALUES (?, ?)',
          [id, partyId]
        );
      }
    }

    if (department_ids && Array.isArray(department_ids) && department_ids.length > 0) {
      for (const departmentId of department_ids) {
        await connection.execute(
          'INSERT INTO member_departments (member_id, department_id) VALUES (?, ?)',
          [id, departmentId]
        );
      }
    }

    await connection.commit();
    
    console.log('성도 수정 성공:', id);
    
    res.json({ 
      id: parseInt(id), 
      name, 
      phone,
      message: '성도 정보가 성공적으로 수정되었습니다.' 
    });
  } catch (error) {
    await connection.rollback();
    console.error('성도 수정 오류:', error);
    console.error('에러 상세:', error.message);
    console.error('스택:', error.stack);
    res.status(500).json({ 
      error: '성도 정보 수정에 실패했습니다.',
      details: error.message 
    });
  } finally {
    connection.release();
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

// 가족 수정
app.put('/api/families/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { family_name, member_ids } = req.body;
    
    if (!family_name) {
      return res.status(400).json({ error: '가족명은 필수입니다.' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 가족명 수정
      await connection.execute(
        'UPDATE families SET family_name = ? WHERE id = ?',
        [family_name, id]
      );

      // 기존 구성원 관계 삭제
      await connection.execute('DELETE FROM member_families WHERE family_id = ?', [id]);

      // 새로운 구성원 관계 추가
      if (member_ids && Array.isArray(member_ids) && member_ids.length > 0) {
        for (const memberId of member_ids) {
          await connection.execute(
            'INSERT INTO member_families (member_id, family_id) VALUES (?, ?)',
            [memberId, id]
          );
        }
      }

      await connection.commit();
      res.json({ 
        id: parseInt(id), 
        family_name,
        message: '가족 정보가 성공적으로 수정되었습니다.' 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('가족 수정 오류:', error);
    res.status(500).json({ error: '가족 정보 수정에 실패했습니다.' });
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

// 순모임 수정
app.put('/api/parties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { party_name, leader_id, member_ids } = req.body;
    
    if (!party_name) {
      return res.status(400).json({ error: '순명은 필수입니다.' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 순모임 정보 수정
      await connection.execute(
        'UPDATE parties SET party_name = ?, leader_id = ? WHERE id = ?',
        [party_name, leader_id || null, id]
      );

      // 기존 순원 관계 삭제
      await connection.execute('DELETE FROM member_parties WHERE party_id = ?', [id]);

      // 새로운 순원 관계 추가
      if (member_ids && Array.isArray(member_ids) && member_ids.length > 0) {
        for (const memberId of member_ids) {
          await connection.execute(
            'INSERT INTO member_parties (member_id, party_id) VALUES (?, ?)',
            [memberId, id]
          );
        }
      }

      await connection.commit();
      res.json({ 
        id: parseInt(id), 
        party_name,
        message: '순모임 정보가 성공적으로 수정되었습니다.' 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('순모임 수정 오류:', error);
    res.status(500).json({ error: '순모임 정보 수정에 실패했습니다.' });
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
        m1.name as president_name,
        m2.name as vice_president_name,
        m3.name as secretary_name,
        m4.name as treasurer_name,
        m5.name as clerk_name,
        GROUP_CONCAT(DISTINCT m6.name) as members
      FROM departments d
      LEFT JOIN members m1 ON d.president_id = m1.id
      LEFT JOIN members m2 ON d.vice_president_id = m2.id
      LEFT JOIN members m3 ON d.secretary_id = m3.id
      LEFT JOIN members m4 ON d.treasurer_id = m4.id
      LEFT JOIN members m5 ON d.clerk_id = m5.id
      LEFT JOIN member_departments md ON d.id = md.department_id
      LEFT JOIN members m6 ON md.member_id = m6.id
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
    const { department_name, president_id, vice_president_id, secretary_id, treasurer_id, clerk_id, member_ids } = req.body;
    
    if (!department_name) {
      return res.status(400).json({ error: '부서명은 필수입니다.' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.execute(
        'INSERT INTO departments (department_name, president_id, vice_president_id, secretary_id, treasurer_id, clerk_id) VALUES (?, ?, ?, ?, ?, ?)',
        [
          department_name, 
          president_id || null,
          vice_president_id || null,
          secretary_id || null,
          treasurer_id || null,
          clerk_id || null
        ]
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

// 부서 수정
app.put('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { department_name, president_id, vice_president_id, secretary_id, treasurer_id, clerk_id, member_ids } = req.body;
    
    if (!department_name) {
      return res.status(400).json({ error: '부서명은 필수입니다.' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 부서 정보 수정
      await connection.execute(
        'UPDATE departments SET department_name = ?, president_id = ?, vice_president_id = ?, secretary_id = ?, treasurer_id = ?, clerk_id = ? WHERE id = ?',
        [
          department_name,
          president_id || null,
          vice_president_id || null,
          secretary_id || null,
          treasurer_id || null,
          clerk_id || null,
          id
        ]
      );

      // 기존 부서원 관계 삭제
      await connection.execute('DELETE FROM member_departments WHERE department_id = ?', [id]);

      // 새로운 부서원 관계 추가
      if (member_ids && Array.isArray(member_ids) && member_ids.length > 0) {
        for (const memberId of member_ids) {
          await connection.execute(
            'INSERT INTO member_departments (member_id, department_id) VALUES (?, ?)',
            [memberId, id]
          );
        }
      }

      await connection.commit();
      res.json({ 
        id: parseInt(id), 
        department_name,
        message: '부서 정보가 성공적으로 수정되었습니다.' 
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('부서 수정 오류:', error);
    res.status(500).json({ error: '부서 정보 수정에 실패했습니다.' });
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

