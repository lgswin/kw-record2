-- 출석부 이벤트 테이블에 작성자 필드 추가

USE kwchurchdb;

-- creator_id 컬럼 추가 (성도 ID 참조)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='attendance_events' AND COLUMN_NAME='creator_id');
SET @sqlstmt := IF(@exist=0, 
  'ALTER TABLE attendance_events ADD COLUMN creator_id INT COMMENT ''작성자 ID (members 테이블 참조)'' AFTER event_date', 
  'SELECT ''Column creator_id already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 외래 키 추가 (선택사항 - 데이터 무결성 보장)
SET @exist_fk := (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                  WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='attendance_events' 
                  AND COLUMN_NAME='creator_id' AND CONSTRAINT_NAME='fk_attendance_creator');
SET @sqlstmt_fk := IF(@exist_fk=0,
  'ALTER TABLE attendance_events ADD CONSTRAINT fk_attendance_creator FOREIGN KEY (creator_id) REFERENCES members(id) ON DELETE SET NULL',
  'SELECT ''Foreign key already exists''');
PREPARE stmt_fk FROM @sqlstmt_fk;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

