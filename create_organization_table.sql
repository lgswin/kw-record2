-- organization 테이블 생성 (교회 조직 운영 인원 관리)

USE kwchurchdb;

-- organization 테이블 생성
CREATE TABLE IF NOT EXISTS organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  member_id INT NULL COMMENT '성도 ID (members 테이블 참조)',
  position VARCHAR(100) NOT NULL COMMENT '직책 (담임목사, 부목사, 교육전도사, 교구목사, 시무장로, 시무권사, 안수집사 등)',
  responsibility VARCHAR(255) COMMENT '담당부서 또는 담당업무',
  appointment_date DATE COMMENT '임명날짜 또는 시작날짜',
  active BOOLEAN DEFAULT TRUE COMMENT '활성화 여부',
  notes TEXT COMMENT '특이사항',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
  INDEX idx_member_id (member_id),
  INDEX idx_position (position),
  INDEX idx_active (active)
) COMMENT='교회 조직 운영 인원 관리';

-- 컬럼 확인
SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kwchurchdb' AND TABLE_NAME = 'organizations'
ORDER BY ORDINAL_POSITION;

