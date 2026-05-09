ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS action_type ENUM('website','call','whatsapp','lead') DEFAULT 'website';
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS phone_number VARCHAR(40) DEFAULT NULL;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS whatsapp_number VARCHAR(40) DEFAULT NULL;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS lead_fields JSON DEFAULT NULL;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS placement_calls TINYINT(1) DEFAULT 0;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS cost_per_lead DECIMAL(10,4) DEFAULT 0.0000;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS leads BIGINT DEFAULT 0;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS verification_required TINYINT(1) DEFAULT 0;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS verification_fields JSON DEFAULT NULL;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS verification_documents JSON DEFAULT NULL;
ALTER TABLE user_ads ADD COLUMN IF NOT EXISTS verification_status ENUM('not_required','requested','submitted','approved','rejected') DEFAULT 'not_required';
ALTER TABLE user_ads MODIFY COLUMN status ENUM('draft','pending','approved','paused','hold','suspended','document_requested','ended','rejected') DEFAULT 'pending';

CREATE TABLE IF NOT EXISTS user_ad_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ad_id INT NOT NULL,
  owner_user_id INT NOT NULL,
  viewer_user_id INT NULL,
  event_type ENUM('impression','click','lead','call','whatsapp','website_visit') DEFAULT 'impression',
  placement VARCHAR(50) DEFAULT NULL,
  cost DECIMAL(10,4) DEFAULT 0.0000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_id) REFERENCES user_ads(id) ON DELETE CASCADE,
  INDEX idx_user_ad_events_ad (ad_id),
  INDEX idx_user_ad_events_owner (owner_user_id),
  INDEX idx_user_ad_events_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_ad_leads (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ad_id INT NOT NULL,
  owner_user_id INT NOT NULL,
  viewer_user_id INT NULL,
  lead_data JSON NOT NULL,
  cost DECIMAL(10,4) DEFAULT 0.0000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ad_id) REFERENCES user_ads(id) ON DELETE CASCADE,
  INDEX idx_user_ad_leads_ad (ad_id),
  INDEX idx_user_ad_leads_owner (owner_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
