-- Independent revision and payload: older clients update only snapshot/revision.
ALTER TABLE public.learner_progress
  ADD COLUMN IF NOT EXISTS branch_revision integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS branch_snapshot jsonb,
  ADD COLUMN IF NOT EXISTS branch_updated_at timestamptz;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'learner_branch_progress_valid' AND conrelid = 'public.learner_progress'::regclass) THEN
    ALTER TABLE public.learner_progress ADD CONSTRAINT learner_branch_progress_valid CHECK (
      (branch_revision = 0 AND branch_snapshot IS NULL AND branch_updated_at IS NULL)
      OR (branch_revision > 0 AND jsonb_typeof(branch_snapshot) = 'object' AND branch_updated_at IS NOT NULL)
    );
  END IF;
END $$;
