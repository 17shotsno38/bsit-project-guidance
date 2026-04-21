USE guidance_db;

CREATE TABLE IF NOT EXISTS WalkInEntry (
  id VARCHAR(255) PRIMARY KEY,
  userId VARCHAR(255),
  queueNumber INT NOT NULL,
  status ENUM('waiting','serving','done','withdrawn') NOT NULL DEFAULT 'waiting',
  joinedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE SET NULL
);

SHOW TABLES;
