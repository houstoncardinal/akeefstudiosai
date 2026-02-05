-- Allow anonymous access to jobs table for public use
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can insert their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update their own jobs" ON public.jobs;

-- Create public policies for jobs
CREATE POLICY "Anyone can view jobs"
ON public.jobs FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert jobs"
ON public.jobs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update jobs"
ON public.jobs FOR UPDATE
USING (true);

-- Allow anonymous access to rate_limits table
DROP POLICY IF EXISTS "Users can view their own rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can insert their own rate limit" ON public.rate_limits;
DROP POLICY IF EXISTS "Users can update their own rate limit" ON public.rate_limits;

CREATE POLICY "Anyone can view rate limits"
ON public.rate_limits FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert rate limits"
ON public.rate_limits FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update rate limits"
ON public.rate_limits FOR UPDATE
USING (true);

-- Update storage policies for anonymous access
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

CREATE POLICY "Anyone can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'fcpxml-files');

CREATE POLICY "Anyone can view files"
ON storage.objects FOR SELECT
USING (bucket_id = 'fcpxml-files');

CREATE POLICY "Anyone can download files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'fcpxml-files');

-- Make user_id nullable in jobs table for anonymous jobs
ALTER TABLE public.jobs ALTER COLUMN user_id DROP NOT NULL;

-- Make user_id nullable in rate_limits table
ALTER TABLE public.rate_limits ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.rate_limits DROP CONSTRAINT IF EXISTS rate_limits_user_id_key;