-- Test booking links for the comercial team
-- Run after 001 and 002.
INSERT INTO plaz_scheduler.booking_links (client_id, team_id, max_uses, label)
VALUES
  ('plaz', 'comercial', NULL, 'Link general — Equipo Comercial Plaz'),
  ('plaz', 'comercial', 1,   'Link single-use — prueba');

-- Verify
SELECT id, label, max_uses, use_count, active FROM plaz_scheduler.booking_links;
