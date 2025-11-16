-- 신앙교육 관련 테이블 생성

USE kwchurchdb;

-- 신앙교육 프로그램 테이블
CREATE TABLE IF NOT EXISTS education_programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '신앙교육 프로그램 이름',
  description TEXT COMMENT '프로그램 설명',
  active BOOLEAN DEFAULT TRUE COMMENT '활성 여부',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 성도별 신앙교육 기록 테이블
CREATE TABLE IF NOT EXISTS member_educations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NOT NULL COMMENT '성도 ID',
  program_id INT NOT NULL COMMENT '신앙교육 프로그램 ID',
  start_date DATE COMMENT '시작일',
  completion_date DATE COMMENT '완료일',
  completed BOOLEAN DEFAULT FALSE COMMENT '완료 여부',
  notes TEXT COMMENT '비고',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  FOREIGN KEY (program_id) REFERENCES education_programs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_member_program (member_id, program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 신앙교육 프로그램 추가 (선택사항)
INSERT INTO education_programs (name, description) VALUES
  ('새신자 교육', '새신자를 위한 기본 신앙교육'),
  ('세례 교육', '세례를 받기 위한 교육'),
  ('제자 훈련', '제자 훈련 과정'),
  ('리더십 교육', '교회 리더를 위한 교육')
ON DUPLICATE KEY UPDATE name=name;

-- 컬럼 확인
SELECT 'education_programs 테이블 컬럼:' as info;
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kwchurchdb' AND TABLE_NAME = 'education_programs';

SELECT 'member_educations 테이블 컬럼:' as info;
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kwchurchdb' AND TABLE_NAME = 'member_educations';

