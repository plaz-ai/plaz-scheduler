-- Secure opaque booking links — the UUID is what the public URL exposes,
-- never the team_slug or any internal identifier.
CREATE TABLE IF NOT EXISTS plaz_scheduler.booking_links (
  id           UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id    TEXT         NOT NULL REFERENCES plaz_scheduler.clients(id),
  team_id      TEXT         NOT NULL REFERENCES plaz_scheduler.teams(id),
  label        TEXT,
  active       BOOLEAN      NOT NULL DEFAULT true,
  -- NULL = unlimited uses; 1 = single-use; N = N uses total
  max_uses     INT          DEFAULT NULL,
  -- incremented only when a booking is confirmed (not on link open)
  use_count    INT          NOT NULL DEFAULT 0,
  expires_at   TIMESTAMPTZ  DEFAULT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE plaz_scheduler.booking_links ENABLE ROW LEVEL SECURITY;
