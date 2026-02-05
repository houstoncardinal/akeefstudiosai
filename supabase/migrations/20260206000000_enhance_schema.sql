-- ============================================
-- Migration: Enhance Schema
-- Hardens DB, adds analysis metadata, indexes,
-- RPC functions, cleanup scheduling
-- ============================================

-- ============================================
-- 1. ADD ANALYSIS METADATA TO JOBS TABLE
-- ============================================
-- Stores client-side analysis results as structured JSONB.
-- Expected shape:
--   {
--     "audio": { "bpm": 120, "duration": 180.5, "beatCount": 52 },
--     "video": { "sceneCount": 8, "duration": 180.5, "averageBrightness": 0.65, "frameCount": 360 },
--     "color": { "contrast": 1.1, "saturation": 0.9, "temperature": 300, "shadows": -10, "highlights": 5 },
--     "effects": { "disabledTransitions": [...], "disabledMotionEffects": [...] },
--     "detectedFormat": "mov_prores"
--   }

ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS analysis_metadata JSONB DEFAULT NULL;

COMMENT ON COLUMN public.jobs.analysis_metadata IS
  'Client-side analysis results: audio (BPM, beats), video (scenes, brightness), color settings, effect overrides';


-- ============================================
-- 2. ADD updated_at TO JOBS TABLE
-- ============================================

ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Reuse existing update_updated_at_column() trigger function
DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================
-- 3. COMPOSITE INDEX ON RATE_LIMITS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_rate_limits_id_window
ON public.rate_limits (id, window_start);


-- ============================================
-- 4. ADDITIONAL INDEXES FOR COMMON QUERY PATTERNS
-- ============================================

-- Filter by model + status
CREATE INDEX IF NOT EXISTS idx_jobs_model_status
ON public.jobs (model, status);

-- Filter by preset + status
CREATE INDEX IF NOT EXISTS idx_jobs_preset_status
ON public.jobs (preset, status);

-- Filtered + sorted queries (e.g. "all failed jobs, newest first")
CREATE INDEX IF NOT EXISTS idx_jobs_status_created_at
ON public.jobs (status, created_at DESC);

-- Partial index for active jobs — speeds up cleanup_stale_jobs()
CREATE INDEX IF NOT EXISTS idx_jobs_processing
ON public.jobs (created_at)
WHERE status = 'processing';


-- ============================================
-- 5. IDEMPOTENT RECREATION OF ALL EXISTING FUNCTIONS
-- ============================================

-- 5a. handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5b. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 5c. cleanup_expired_rate_limits
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.rate_limits
    WHERE window_start < now() - INTERVAL '2 hours';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5d. cleanup_stale_jobs (enhanced: now sets completed_at)
CREATE OR REPLACE FUNCTION public.cleanup_stale_jobs()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.jobs
    SET status = 'failed',
        error_message = 'Job timed out after 10 minutes',
        completed_at = now()
    WHERE status = 'processing'
      AND created_at < now() - INTERVAL '10 minutes';
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ============================================
-- 6. RPC FUNCTION: get_job_stats()
-- ============================================

CREATE OR REPLACE FUNCTION public.get_job_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_jobs', COUNT(*),
        'completed_jobs', COUNT(*) FILTER (WHERE status = 'completed'),
        'failed_jobs', COUNT(*) FILTER (WHERE status = 'failed'),
        'processing_jobs', COUNT(*) FILTER (WHERE status = 'processing'),
        'pending_jobs', COUNT(*) FILTER (WHERE status = 'pending'),
        'avg_processing_seconds', ROUND(
            EXTRACT(EPOCH FROM AVG(
                completed_at - created_at
            ) FILTER (WHERE status = 'completed' AND completed_at IS NOT NULL))::numeric,
            2
        ),
        'jobs_last_24h', COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '24 hours'),
        'jobs_last_7d', COUNT(*) FILTER (WHERE created_at > now() - INTERVAL '7 days'),
        'most_used_model', (
            SELECT model FROM public.jobs
            GROUP BY model ORDER BY COUNT(*) DESC LIMIT 1
        ),
        'most_used_preset', (
            SELECT preset FROM public.jobs
            GROUP BY preset ORDER BY COUNT(*) DESC LIMIT 1
        )
    ) INTO result
    FROM public.jobs;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_job_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_stats() TO anon;


-- ============================================
-- 7. ORPHANED STORAGE FILE FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION public.find_orphaned_storage_files()
RETURNS TABLE(orphaned_path TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT s.name AS orphaned_path
    FROM storage.objects s
    WHERE s.bucket_id = 'fcpxml-files'
      AND s.name NOT IN (
          SELECT COALESCE(j.input_file_path, '') FROM public.jobs j
          UNION
          SELECT COALESCE(j.output_file_path, '') FROM public.jobs j
      )
      AND s.created_at < now() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.count_orphaned_storage_files()
RETURNS INTEGER AS $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphan_count
    FROM public.find_orphaned_storage_files();
    RETURN orphan_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.find_orphaned_storage_files() TO service_role;
GRANT EXECUTE ON FUNCTION public.count_orphaned_storage_files() TO service_role;


-- ============================================
-- 8. PG_CRON SCHEDULING (graceful fallback)
-- ============================================

DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

    -- Cleanup expired rate limit windows every 30 minutes
    PERFORM cron.unschedule('cleanup-expired-rate-limits');
    PERFORM cron.schedule(
        'cleanup-expired-rate-limits',
        '*/30 * * * *',
        'SELECT public.cleanup_expired_rate_limits()'
    );

    -- Cleanup stale processing jobs every 5 minutes
    PERFORM cron.unschedule('cleanup-stale-jobs');
    PERFORM cron.schedule(
        'cleanup-stale-jobs',
        '*/5 * * * *',
        'SELECT public.cleanup_stale_jobs()'
    );

    -- Log orphaned file count daily at 3 AM UTC
    PERFORM cron.unschedule('log-orphaned-files');
    PERFORM cron.schedule(
        'log-orphaned-files',
        '0 3 * * *',
        'SELECT public.count_orphaned_storage_files()'
    );

    RAISE NOTICE 'pg_cron scheduled: cleanup-expired-rate-limits (30min), cleanup-stale-jobs (5min), log-orphaned-files (daily 3AM UTC)';

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron not available (%). Cleanup functions exist but must be called manually or via edge function.', SQLERRM;
END;
$$;
