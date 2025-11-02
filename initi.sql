-- Members 테이블 (성도) - 가장 먼저 생성
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(255) COMMENT '주소',
  gender ENUM('M', 'F') COMMENT 'M: 남성, F: 여성',
  birth_date DATE COMMENT '생년월일',
  baptized BOOLEAN DEFAULT FALSE COMMENT '세례 여부',
  baptism_date DATE COMMENT '세례일자',
  registration_date DATE COMMENT '등록일',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Families 테이블 (가족)
CREATE TABLE IF NOT EXISTS families (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Member-Family 관계 테이블 (가족 구성원)
CREATE TABLE IF NOT EXISTS member_families (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  family_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_family (member_id, family_id)
);

-- Departments 테이블 (부서) - 부서장 포함
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL,
  president_id INT COMMENT '회장의 member id',
  vice_president_id INT COMMENT '부회장의 member id',
  secretary_id INT COMMENT '총무의 member id',
  treasurer_id INT COMMENT '회계의 member id',
  clerk_id INT COMMENT '서기의 member id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (president_id) REFERENCES members(id) ON DELETE SET NULL,
  FOREIGN KEY (vice_president_id) REFERENCES members(id) ON DELETE SET NULL,
  FOREIGN KEY (secretary_id) REFERENCES members(id) ON DELETE SET NULL,
  FOREIGN KEY (treasurer_id) REFERENCES members(id) ON DELETE SET NULL,
  FOREIGN KEY (clerk_id) REFERENCES members(id) ON DELETE SET NULL
);

-- Member-Department 관계 테이블 (부서원)
CREATE TABLE IF NOT EXISTS member_departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  department_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_department (member_id, department_id)
);

-- Parties 테이블 (순모임) - 순장 포함
CREATE TABLE IF NOT EXISTS parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_name VARCHAR(100) NOT NULL,
  leader_id INT COMMENT '순장의 member id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES members(id) ON DELETE SET NULL
);

-- Member-Party 관계 테이블 (순원)
CREATE TABLE IF NOT EXISTS member_parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  party_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_party (member_id, party_id)
);

-- Office 테이블 (직분 리스트)
CREATE TABLE IF NOT EXISTS offices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  office_name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Member-Office 관계 테이블 (성도의 직분)
CREATE TABLE IF NOT EXISTS member_offices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  office_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_office (member_id, office_id)
);

-- 기본 직분 데이터 (중복 방지)
INSERT IGNORE INTO offices (office_name) VALUES 
('목사'),
('부목사'),
('장로'),
('권사'),
('장립집사'),
('안수집사'),
('서리집사'),
('집사'),
('전도사'),
('강도사'),
('사모'),
('성도');

-- 샘플 가족 데이터
INSERT INTO families (family_name) VALUES 
('김씨 가족'),
('이씨 가족'),
('박씨 가족');

-- 샘플 순모임 데이터
INSERT INTO parties (party_name) VALUES 
('1순'),
('2순'),
('3순'),
('4순');

-- 샘플 부서 데이터
INSERT INTO departments (department_name) VALUES 
('찬양부'),
('예배부'),
('전도부'),
('교육부');

-- 샘플 멤버 데이터 삽입
INSERT INTO members (name, phone, address, gender, birth_date, baptized, baptism_date, registration_date) VALUES 
('김성도', '010-1234-5678', '서울시 강남구', 'M', '1980-01-15', TRUE, '2000-03-15', '2000-01-01'),
('이교인', '010-2345-6789', '서울시 서초구', 'F', '1985-05-20', TRUE, '2005-06-10', '2005-01-01'),
('박신자', '010-3456-7890', '서울시 송파구', 'M', '1990-09-30', FALSE, NULL, '2020-01-01');

-- 샘플 관계 데이터
-- 가족 관계: 김성도를 김씨 가족에 할당
INSERT INTO member_families (member_id, family_id) VALUES 
(1, 1),
(2, 2),
(3, 3);

-- 직분 관계: 김성도를 장로로, 이교인을 권사로 할당
INSERT INTO member_offices (member_id, office_id) VALUES 
(1, 2),  -- 김성도 = 장로
(2, 4),  -- 이교인 = 권사
(3, 3);  -- 박신자 = 집사

-- 부서 관계: 김성도를 찬양부 부서원으로 할당
INSERT INTO member_departments (member_id, department_id) VALUES 
(1, 1),  -- 김성도 = 찬양부
(2, 2),  -- 이교인 = 예배부
(3, 3);  -- 박신자 = 전도부

-- 순모임 관계: 김성도를 1순 순원으로 할당
INSERT INTO member_parties (member_id, party_id) VALUES 
(1, 1),  -- 김성도 = 1순
(2, 2),  -- 이교인 = 2순
(3, 3);  -- 박신자 = 3순

-- 부서장 설정: 김성도를 찬양부 부서장으로 설정
UPDATE departments SET leader_id = 1 WHERE id = 1;

-- 순장 설정: 김성도를 1순 순장으로 설정
UPDATE parties SET leader_id = 1 WHERE id = 1;