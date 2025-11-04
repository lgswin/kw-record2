-- members 테이블에 active, visit_dates, notes 컬럼 추가

USE kwchurchdb;

-- active 여부
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='active');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN active BOOLEAN DEFAULT TRUE COMMENT ''활성 여부''', 'SELECT ''Column active already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 심방날짜 (JSON 배열로 저장)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='visit_dates');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN visit_dates JSON COMMENT ''심방날짜 배열''', 'SELECT ''Column visit_dates already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 특이사항
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='notes');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN notes TEXT COMMENT ''특이사항''', 'SELECT ''Column notes already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 컬럼 확인
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kwchurchdb' AND TABLE_NAME = 'members' 
  AND COLUMN_NAME IN ('active', 'visit_dates', 'notes');


