ALTER TABLE shared_lists ADD COLUMN featured BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_shared_featured ON shared_lists (featured, created_at DESC);
