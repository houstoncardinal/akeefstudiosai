-- Create storage bucket for custom LUTs
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-luts', 'custom-luts', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own LUTs
CREATE POLICY "Users can upload their own LUTs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'custom-luts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to view their own LUTs
CREATE POLICY "Users can view their own LUTs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'custom-luts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public access to LUTs (for preview)
CREATE POLICY "Public can view LUTs"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'custom-luts');

-- Allow users to delete their own LUTs
CREATE POLICY "Users can delete their own LUTs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'custom-luts' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create table to store LUT metadata
CREATE TABLE public.custom_luts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'custom',
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  intensity NUMERIC DEFAULT 100,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_luts ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_luts
CREATE POLICY "Users can view their own custom LUTs"
ON public.custom_luts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom LUTs"
ON public.custom_luts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom LUTs"
ON public.custom_luts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom LUTs"
ON public.custom_luts FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_custom_luts_updated_at
BEFORE UPDATE ON public.custom_luts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();