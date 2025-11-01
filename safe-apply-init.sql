-- 안전한 초기화 스크립트 (기존 데이터 보존)

USE kwchurchdb;

-- Members 테이블이 없다면 생성, 있다면 필요한 컬럼만 추가
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

-- 기존 테이블에 컬럼이 없다면 추가 (ALTER TABLE은 안전하게)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='address');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN address VARCHAR(255) COMMENT ''주소''', 'SELECT ''Column address already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='gender');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN gender ENUM(''M'', ''F'') COMMENT ''M: 남성, F: 여성''', 'SELECT ''Column gender already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='birth_date');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN birth_date DATE COMMENT ''생년월일''', 'SELECT ''Column birth_date already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='baptized');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN baptized BOOLEAN DEFAULT FALSE COMMENT ''세례 여부''', 'SELECT ''Column baptized already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='baptism_date');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN baptism_date DATE COMMENT ''세례일자''', 'SELECT ''Column baptism_date already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='registration_date');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN registration_date DATE COMMENT ''등록일''', 'SELECT ''Column registration_date already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 나머지 테이블들은 CREATE TABLE IF NOT EXISTS 사용 (원본 initi.sql의 나머지 부분)
-- 여기서는 간단히 필요한 테이블만 생성

CREATE TABLE IF NOT EXISTS families (
  id INT AUTO_INCREMENT PRIMARY KEY,
  family_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS member_families (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  family_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_family (member_id, family_id)
);

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(100) NOT NULL,
  leader_id INT COMMENT '부서장의 member id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS member_departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  department_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_department (member_id, department_id)
);

CREATE TABLE IF NOT EXISTS parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  party_name VARCHAR(100) NOT NULL,
  leader_id INT COMMENT '순장의 member id',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES members(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS member_parties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  party_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_party (member_id, party_id)
);

CREATE TABLE IF NOT EXISTS offices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  office_name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS member_offices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL,
  office_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_office (member_id, office_id)
);

-- 샘플 데이터는 중복 체크 후 삽입
INSERT IGNORE INTO offices (office_name) VALUES 
('목사'),
('장로'),
('집사'),
('권사'),
('전도사');

-- 기존 데이터 확인 메시지
SELECT 'Database schema applied successfully!' as message;

