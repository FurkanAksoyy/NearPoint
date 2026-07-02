ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'USER';

-- To grant admin access, run this once against your database (never commit real emails):
--   UPDATE users SET role = 'ADMIN' WHERE email = 'you@example.com';
