-- faith_head 컬럼을 BOOLEAN에서 VARCHAR로 변경
-- 신앙세대주를 텍스트로 저장할 수 있도록 수정

USE kwchurchdb;

-- 기존 데이터 백업 (BOOLEAN 값이 있으면 텍스트로 변환)
-- true/1 -> '예', false/0 -> '', NULL -> NULL

-- 컬럼 타입 변경 전에 데이터 변환 확인
SELECT id, name, faith_head FROM members WHERE faith_head IS NOT NULL LIMIT 10;

-- 컬럼 타입 변경
-- BOOLEAN -> VARCHAR(50)
ALTER TABLE members 
MODIFY COLUMN faith_head VARCHAR(50) COMMENT '신앙세대주';

-- 기존 boolean 값을 텍스트로 변환 (필요한 경우)
-- UPDATE members SET faith_head = CASE 
--   WHEN faith_head = 1 OR faith_head = TRUE THEN '예'
--   WHEN faith_head = 0 OR faith_head = FALSE THEN ''
--   ELSE NULL
-- END WHERE faith_head IS NOT NULL;

SELECT 'faith_head 컬럼이 VARCHAR(50)으로 성공적으로 변경되었습니다.' AS result;

