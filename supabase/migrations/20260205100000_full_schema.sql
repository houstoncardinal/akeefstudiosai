-- ============================================
-- AKEEF STUDIO AI - Complete Database Schema
-- Run this in the Supabase SQL Editor for a fresh project
-- ============================================

-- ============================================
-- 1. PROFILES TABLE (user metadata)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 2. JOBS TABLE (AI processing history)
-- ============================================

-- Status enum for type safety
DO $$ BEGIN
    CREATE TYPE public.job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.jobs (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- nullable for anonymous
    input_filename   TEXT NOT NULL,
    output_filename  TEXT,
    input_file_path  TEXT,
    output_file_path TEXT,
    preset           TEXT NOT NULL,
    model            TEXT NOT NULL,
    style_rules      TEXT,
    status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message    TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at     TIMESTAMPTZ
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Jobs: open access (anonymous usage supported)
-- The edge function uses the service_role key which bypasses RLS,
-- but the frontend needs SELECT for History page
CREATE POLICY "jobs_select_all" ON public.jobs
    FOR SELECT USING (true);

CREATE POLICY "jobs_insert_all" ON public.jobs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "jobs_update_all" ON public.jobs
    FOR UPDATE USING (true);

-- Indexes for jobs
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs (user_id) WHERE user_id IS NOT NULL;

-- ============================================
-- 3. RATE LIMITS TABLE (per-session throttling)
-- ============================================
-- id = session ID string (from crypto.randomUUID() on client or "anonymous")
-- NOT a UUID type because it can be arbitrary strings

CREATE TABLE IF NOT EXISTS public.rate_limits (
    id            TEXT PRIMARY KEY,
    user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    job_count     INTEGER NOT NULL DEFAULT 0,
    window_start  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits: open access (edge function uses service_role)
CREATE POLICY "rate_limits_select_all" ON public.rate_limits
    FOR SELECT USING (true);

CREATE POLICY "rate_limits_insert_all" ON public.rate_limits
    FOR INSERT WITH CHECK (true);

CREATE POLICY "rate_limits_update_all" ON public.rate_limits
    FOR UPDATE USING (true);

-- Index for rate limit window queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits (window_start);

-- ============================================
-- 4. STORAGE BUCKET (FCPXML output files)
-- ============================================

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'fcpxml-files',
    'fcpxml-files',
    true,                                           -- public read for downloads
    52428800,                                       -- 50MB max file size
    ARRAY['application/xml', 'text/xml']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['application/xml', 'text/xml']::text[];

-- Storage policies: anyone can read (public bucket), service_role handles uploads
-- Drop old policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can download files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_read" ON storage.objects;
DROP POLICY IF EXISTS "storage_service_upload" ON storage.objects;
DROP POLICY IF EXISTS "storage_service_delete" ON storage.objects;

-- Public read access for downloading exports
CREATE POLICY "storage_public_read" ON storage.objects
    FOR SELECT USING (bucket_id = 'fcpxml-files');

-- Upload access (service_role bypasses RLS, but also allow authenticated users)
CREATE POLICY "storage_service_upload" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'fcpxml-files');

-- Update access for upserts
CREATE POLICY "storage_service_update" ON storage.objects
    FOR UPDATE USING (bucket_id = 'fcpxml-files');

-- Delete access
CREATE POLICY "storage_service_delete" ON storage.objects
    FOR DELETE USING (bucket_id = 'fcpxml-files');

-- ============================================
-- 5. HELPER FUNCTION: Clean old rate limit windows
-- ============================================
-- Can be called periodically via pg_cron or manually

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

-- ============================================
-- 6. HELPER FUNCTION: Clean old failed/stale jobs
-- ============================================

CREATE OR REPLACE FUNCTION public.cleanup_stale_jobs()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Mark jobs stuck in "processing" for over 10 minutes as failed
    UPDATE public.jobs
    SET status = 'failed',
        error_message = 'Job timed out after 10 minutes'
    WHERE status = 'processing'
      AND created_at < now() - INTERVAL '10 minutes';
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
