INSERT INTO last_synced_per_account (username, last_synced)
VALUES (?, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET last_synced = CURRENT_TIMESTAMP;
