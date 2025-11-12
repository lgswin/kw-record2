-- member_departments 테이블에 position_name 컬럼 추가
ALTER TABLE member_departments 
ADD COLUMN position_name VARCHAR(100) COMMENT '직책명' AFTER department_id;

-- 기존 데이터에 기본값 설정 (필요한 경우)
-- UPDATE member_departments SET position_name = '부서원' WHERE position_name IS NULL;

