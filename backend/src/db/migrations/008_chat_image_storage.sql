-- ═══════════════════════════════════════════════════════════
-- CHAT IMAGE STORAGE - Supabase Storage Bucket
-- ═══════════════════════════════════════════════════════════
-- This migration creates a storage bucket for chat images
-- ═══════════════════════════════════════════════════════════

-- Step 1: Create storage bucket for chat images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true, -- Public bucket so images can be viewed
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create RLS policies for storage bucket

-- Allow authenticated users to upload images to their own folders
CREATE POLICY "Users can upload to own chat folders"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to view chat images (public bucket)
CREATE POLICY "Anyone can view chat images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chat-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Step 3: Verification
DO $$
DECLARE
  bucket_exists BOOLEAN;
  policy_count INTEGER;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'chat-images'
  ) INTO bucket_exists;

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%chat%';

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ CHAT IMAGE STORAGE MIGRATION COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Storage bucket created: %', bucket_exists;
  RAISE NOTICE 'Storage policies: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '📦 Bucket settings:';
  RAISE NOTICE '  • Name: chat-images';
  RAISE NOTICE '  • Public: YES';
  RAISE NOTICE '  • Max file size: 5MB';
  RAISE NOTICE '  • Allowed types: JPEG, PNG, GIF, WebP';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready to accept image uploads!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
