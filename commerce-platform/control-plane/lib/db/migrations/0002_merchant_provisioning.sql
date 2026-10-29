CREATE TABLE IF NOT EXISTS "merchant_provisions" (
  "id" uuid PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
  "slug" varchar(48) NOT NULL,
  "display_name" varchar(100) NOT NULL,
  "state" varchar(24) DEFAULT 'requested' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "last_error" text,
  "edge_synced_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "merchant_provisions_team_id_unique" UNIQUE("team_id"),
  CONSTRAINT "merchant_provisions_slug_unique" UNIQUE("slug"),
  CONSTRAINT "merchant_provisions_slug_check" CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$'),
  CONSTRAINT "merchant_provisions_state_check" CHECK (state IN ('requested','edge_pending','waiting_backend','active','failed'))
);
