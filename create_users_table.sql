-- users 테이블 생성

USE kwchurchdb;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE COMMENT '사용자명',
  password VARCHAR(255) NOT NULL COMMENT '비밀번호 (해시)',
  role ENUM('admin', 'user') DEFAULT 'user' COMMENT '권한: admin(관리자), user(일반사용자)',
  name VARCHAR(100) COMMENT '이름',
  email VARCHAR(255) COMMENT '이메일',
  active BOOLEAN DEFAULT TRUE COMMENT '활성 여부',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 기본 관리자 계정은 create_admin_user.js 스크립트로 생성하세요
-- node create_admin_user.js

-- 컬럼 확인
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kwchurchdb' AND TABLE_NAME = 'users';

