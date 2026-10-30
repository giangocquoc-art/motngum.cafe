CREATE TABLE IF NOT EXISTS "site_submissions" (
  "id" uuid PRIMARY KEY NOT NULL,
  "request_id" uuid NOT NULL,
  "site_id" uuid NOT NULL REFERENCES "public"."builder_sites"("id") ON DELETE CASCADE,
  "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
  "block_id" varchar(100) NOT NULL,
  "kind" varchar(12) NOT NULL,
  "name" varchar(100),
  "email" varchar(254) NOT NULL,
  "message" varchar(2000),
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "site_submissions_kind_check" CHECK ("kind" IN ('contact','newsletter'))
);
CREATE UNIQUE INDEX IF NOT EXISTS "site_submissions_dedupe" ON "site_submissions" ("site_id", "request_id");
CREATE INDEX IF NOT EXISTS "site_submissions_team_site_created" ON "site_submissions" ("team_id","site_id","created_at");
