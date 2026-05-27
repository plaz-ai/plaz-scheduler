-- Adds per-client availability window (how many days ahead are bookable)
ALTER TABLE plaz_scheduler.clients
  ADD COLUMN IF NOT EXISTS availability_days INT NOT NULL DEFAULT 7;

-- Set initial values per client
UPDATE plaz_scheduler.clients SET availability_days = 3 WHERE id = 'plaz';
