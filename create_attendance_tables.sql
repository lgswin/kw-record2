-- 출석부 이벤트 테이블
CREATE TABLE IF NOT EXISTS attendance_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(255) NOT NULL COMMENT '이벤트명 (예: 주일예배, 수요예배, 특별집회 등)',
  event_date DATETIME NOT NULL COMMENT '이벤트 날짜 및 시간',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='출석부 이벤트';

-- 출석 기록 테이블
CREATE TABLE IF NOT EXISTS attendance_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL COMMENT '이벤트 ID',
  member_id INT NOT NULL COMMENT '성도 ID',
  attended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '출석 체크 시간',
  FOREIGN KEY (event_id) REFERENCES attendance_events(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
  UNIQUE KEY unique_event_member (event_id, member_id),
  INDEX idx_event_id (event_id),
  INDEX idx_member_id (member_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='출석 기록';


