-- Add migration script here
CREATE TABLE last_synced_per_account (
    username TEXT PRIMARY KEY,
    last_synced TIMESTAMP
);
