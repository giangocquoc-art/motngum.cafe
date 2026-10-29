-- Browser drafts become tenant-scoped versioned database documents.
-- Publishing uses an immutable snapshot copied from the validated draft.
CREATE TABLE IF NOT EXISTS "builder_sites" (
  "id" uuid PRIMARY KEY NOT NULL,
  "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
  "created_by" integer NOT NULL REFERENCES "public"."users"("id"),
  "slug" varchar(80) NOT NULL,
  "title" varchar(120) NOT NULL,
  "draft_document" jsonb NOT NULL,
  "draft_version" integer NOT NULL DEFAULT 1,
  "published_document" jsonb,
  "published_version" integer,
  "published_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "builder_sites_slug_unique" UNIQUE ("slug"),
  CONSTRAINT "builder_sites_draft_version_check" CHECK ("draft_version" >= 1),
  CONSTRAINT "builder_sites_publish_consistency" CHECK (
    ("published_document" IS NULL AND "published_version" IS NULL AND "published_at" IS NULL)
    OR ("published_document" IS NOT NULL AND "published_version" IS NOT NULL AND "published_at" IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS "builder_sites_team_idx" ON "builder_sites" ("team_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "builder_site_revisions" (
  "id" uuid PRIMARY KEY NOT NULL,
  "site_id" uuid NOT NULL REFERENCES "public"."builder_sites"("id") ON DELETE CASCADE,
  "team_id" integer NOT NULL REFERENCES "public"."teams"("id"),
  "actor_id" integer NOT NULL REFERENCES "public"."users"("id"),
  "version" integer NOT NULL,
  "document" jsonb NOT NULL,
  "action" varchar(16) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "builder_site_revisions_version_unique" UNIQUE ("site_id", "version"),
  CONSTRAINT "builder_site_revisions_action_check" CHECK ("action" IN ('create','save','restore'))
);
CREATE INDEX IF NOT EXISTS "builder_site_revisions_team_idx" ON "builder_site_revisions" ("team_id");
