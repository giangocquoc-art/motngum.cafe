CREATE TABLE IF NOT EXISTS vault_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT '',
  secret_encrypted text NOT NULL,
  access_salt text NOT NULL,
  access_hash text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS access_limits (
  rate_key text PRIMARY KEY,
  attempts integer NOT NULL DEFAULT 0,
  window_started timestamptz NOT NULL DEFAULT now()
);
