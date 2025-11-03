-- members 테이블에 추가 필드 컬럼 추가 (안전하게)

USE kwchurchdb;

-- 제적날짜
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='dismissal_date');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN dismissal_date DATE COMMENT ''제적날짜''', 'SELECT ''Column dismissal_date already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 소천여부
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='deceased');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN deceased BOOLEAN DEFAULT FALSE COMMENT ''소천여부''', 'SELECT ''Column deceased already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 신앙세대주
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='faith_head');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN faith_head BOOLEAN DEFAULT FALSE COMMENT ''신앙세대주''', 'SELECT ''Column faith_head already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 영문이름
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='english_name');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN english_name VARCHAR(100) COMMENT ''영문이름''', 'SELECT ''Column english_name already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 유아세례 여부
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='infant_baptism');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN infant_baptism BOOLEAN DEFAULT FALSE COMMENT ''유아세례 여부''', 'SELECT ''Column infant_baptism already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 이메일
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='email');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN email VARCHAR(255) COMMENT ''이메일''', 'SELECT ''Column email already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 직업
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='occupation');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN occupation VARCHAR(255) COMMENT ''직업''', 'SELECT ''Column occupation already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 직장전화번호
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='work_phone');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN work_phone VARCHAR(20) COMMENT ''직장전화번호''', 'SELECT ''Column work_phone already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 거주시작일자
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='residence_start_date');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN residence_start_date DATE COMMENT ''거주시작일자''', 'SELECT ''Column residence_start_date already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 전거주지
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='previous_address');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN previous_address VARCHAR(255) COMMENT ''전거주지''', 'SELECT ''Column previous_address already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 섬기던 교회
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='previous_church');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN previous_church VARCHAR(255) COMMENT ''섬기던 교회''', 'SELECT ''Column previous_church already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 전교회 직분
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='previous_office');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN previous_office VARCHAR(255) COMMENT ''전교회 직분''', 'SELECT ''Column previous_office already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 세례교회
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='baptism_church');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN baptism_church VARCHAR(255) COMMENT ''세례교회''', 'SELECT ''Column baptism_church already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 세례년도
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='baptism_year');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN baptism_year INT COMMENT ''세례년도''', 'SELECT ''Column baptism_year already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 세례목사
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='baptism_pastor');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN baptism_pastor VARCHAR(100) COMMENT ''세례목사''', 'SELECT ''Column baptism_pastor already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 학력
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='education');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN education TEXT COMMENT ''학력''', 'SELECT ''Column education already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 사회경력
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='career');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN career TEXT COMMENT ''사회경력''', 'SELECT ''Column career already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 신앙생활
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='faith_life');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN faith_life TEXT COMMENT ''신앙생활''', 'SELECT ''Column faith_life already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 결혼기념일
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='marriage_anniversary');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN marriage_anniversary DATE COMMENT ''결혼기념일''', 'SELECT ''Column marriage_anniversary already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 체류예정기간
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='stay_period');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN stay_period VARCHAR(100) COMMENT ''체류예정기간''', 'SELECT ''Column stay_period already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 특기
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='specialty');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN specialty TEXT COMMENT ''특기''', 'SELECT ''Column specialty already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 봉사경력
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA='kwchurchdb' AND TABLE_NAME='members' AND COLUMN_NAME='service_history');
SET @sqlstmt := IF(@exist=0, 'ALTER TABLE members ADD COLUMN service_history TEXT COMMENT ''봉사경력''', 'SELECT ''Column service_history already exists''');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
