-- Motngum Commerce staging: control-plane registry only.
-- Not a replacement for Medusa's PostgreSQL transaction database.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS merchants (
 id TEXT PRIMARY KEY,
 slug TEXT NOT NULL UNIQUE,
 display_name TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'provisioning' CHECK(state IN ('provisioning','active','suspended','failed','closed')),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now')),
 CHECK(length(slug) BETWEEN 3 AND 48 AND slug NOT GLOB '*[^a-z0-9-]*')
);
CREATE TABLE IF NOT EXISTS merchant_domains (
 id TEXT PRIMARY KEY,
 merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
 hostname TEXT NOT NULL UNIQUE,
 kind TEXT NOT NULL CHECK(kind IN ('subdomain','custom')),
 ownership_state TEXT NOT NULL DEFAULT 'pending' CHECK(ownership_state IN ('pending','verified','failed')),
 tls_state TEXT NOT NULL DEFAULT 'pending' CHECK(tls_state IN ('pending','issued','failed')),
 routing_state TEXT NOT NULL DEFAULT 'pending' CHECK(routing_state IN ('pending','active','suspended','detaching')),
 created_at TEXT NOT NULL DEFAULT (datetime('now')),
 CHECK(hostname = lower(hostname))
);
CREATE INDEX IF NOT EXISTS idx_domains_merchant ON merchant_domains(merchant_id);
CREATE TABLE IF NOT EXISTS service_connections (
 merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
 service_kind TEXT NOT NULL CHECK(service_kind IN ('medusa','chatwoot','cms','pos','automation')),
 endpoint TEXT,
 secret_reference TEXT,
 state TEXT NOT NULL DEFAULT 'disconnected' CHECK(state IN ('disconnected','testing','ready','error')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now')),
 PRIMARY KEY(merchant_id, service_kind)
);
CREATE TABLE IF NOT EXISTS integration_event_inbox (
 merchant_id TEXT NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
 provider TEXT NOT NULL,
 provider_event_id TEXT NOT NULL,
 payload_digest TEXT NOT NULL,
 state TEXT NOT NULL CHECK(state IN ('received','processing','applied','failed','dead_letter')),
 received_at TEXT NOT NULL DEFAULT (datetime('now')),
 processed_at TEXT,
 PRIMARY KEY(merchant_id, provider, provider_event_id)
);
CREATE INDEX IF NOT EXISTS idx_events_status ON integration_event_inbox(state, received_at);
CREATE TABLE IF NOT EXISTS audit_actions (
 id TEXT PRIMARY KEY,
 merchant_id TEXT REFERENCES merchants(id),
 action_type TEXT NOT NULL,
 actor_reference TEXT NOT NULL,
 result TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
