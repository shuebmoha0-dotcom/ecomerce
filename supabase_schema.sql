-- Create a table for processed images
CREATE TABLE public.images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_url TEXT NOT NULL,
  processed_url TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own images
CREATE POLICY "Users can insert their own images" ON public.images
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to view their own images
CREATE POLICY "Users can view their own images" ON public.images
  FOR SELECT USING (true);

-- Create policy to allow users to update their own images
CREATE POLICY "Users can update their own images" ON public.images
  FOR UPDATE USING (true);

-- Create policy to allow users to delete their own images
CREATE POLICY "Users can delete their own images" ON public.images
  FOR DELETE USING (true);

-- Create a storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('user-images', 'user-images', true);

-- Enable RLS on the storage bucket
CREATE POLICY "Allow public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-images');

CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-images');

CREATE POLICY "Allow users to delete their own uploads" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-images');
