-- baptized_type 컬럼 추가
ALTER TABLE members 
ADD COLUMN baptized_type VARCHAR(50) COMMENT '세례 종류: 유아세례, 입교, 세례, 세례 안받음';

