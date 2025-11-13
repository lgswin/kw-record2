-- members 테이블에 새신자 관련 필드 추가

USE kwchurchdb;

-- 새신자 여부
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='is_new_member');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN is_new_member BOOLEAN DEFAULT FALSE COMMENT ''새신자 여부''', 'SELECT ''Column is_new_member already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 첫 출석 날짜
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='first_attendance_date');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN first_attendance_date DATE COMMENT ''첫 출석 날짜''', 'SELECT ''Column first_attendance_date already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 첫 출석 예배/이벤트명
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='first_attendance_event');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN first_attendance_event VARCHAR(255) COMMENT ''첫 출석 예배/이벤트명''', 'SELECT ''Column first_attendance_event already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 컬럼 확인
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kwchurchdb' AND TABLE_NAME = 'members' 
  AND COLUMN_NAME IN ('is_new_member', 'first_attendance_date', 'first_attendance_event');

