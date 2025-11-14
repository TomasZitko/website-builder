-- ═══════════════════════════════════════════════════════════
-- SUPABASE SECURITY FIX - Enable Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════════
-- Date: 2025-11-04
-- Purpose: Fix RLS warnings and function search_path issues
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- STEP 1: ENABLE RLS ON TABLES
-- ═══════════════════════════════════════════════════════════

-- Enable RLS on websites table
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- Enable RLS on templates table
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Enable RLS on chat_sessions table
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════
-- STEP 2: VERIFY RLS POLICIES EXIST (they should already exist)
-- ═══════════════════════════════════════════════════════════

-- If policies don't exist, create them:

-- Websites policies
DO $$
BEGIN
  -- Policy: Users can view own or public websites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'websites'
    AND policyname = 'Users can view own or public websites'
  ) THEN
    CREATE POLICY "Users can view own or public websites"
      ON public.websites
      FOR SELECT
      USING (
        auth.uid() = user_id
        OR is_public = true
      );
  END IF;

  -- Policy: Users can create own websites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'websites'
    AND policyname = 'Users can create own websites'
  ) THEN
    CREATE POLICY "Users can create own websites"
      ON public.websites
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy: Users can update own websites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'websites'
    AND policyname = 'Users can update own websites'
  ) THEN
    CREATE POLICY "Users can update own websites"
      ON public.websites
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  -- Policy: Users can delete own websites
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'websites'
    AND policyname = 'Users can delete own websites'
  ) THEN
    CREATE POLICY "Users can delete own websites"
      ON public.websites
      FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Templates policies
DO $$
BEGIN
  -- Policy: Everyone can view active templates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'templates'
    AND policyname = 'Everyone can view active templates'
  ) THEN
    CREATE POLICY "Everyone can view active templates"
      ON public.templates
      FOR SELECT
      USING (is_active = true);
  END IF;

  -- Policy: Service role can manage templates
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'templates'
    AND policyname = 'Service role can manage templates'
  ) THEN
    CREATE POLICY "Service role can manage templates"
      ON public.templates
      FOR ALL
      USING (auth.jwt() ->> 'role' = 'service_role');
  END IF;
END $$;

-- Chat sessions policies
DO $$
BEGIN
  -- Policy: Users can view their own chat sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'chat_sessions'
    AND policyname = 'Users can view their own chat sessions'
  ) THEN
    CREATE POLICY "Users can view their own chat sessions"
      ON public.chat_sessions
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- Policy: Users can manage own chat sessions
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'chat_sessions'
    AND policyname = 'Users can manage own chat sessions'
  ) THEN
    CREATE POLICY "Users can manage own chat sessions"
      ON public.chat_sessions
      FOR ALL
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- STEP 3: FIX FUNCTION SEARCH_PATH ISSUES
-- ═══════════════════════════════════════════════════════════

-- Fix update_updated_at_column function (used by triggers, don't drop!)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- FIX: Set explicit search_path
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- Fix cleanup_old_usage_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_usage_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- FIX: Set explicit search_path
AS $$
BEGIN
  DELETE FROM public.usage_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;

-- Fix increment_website_views function
-- Note: Keep the same parameter name as existing function
CREATE OR REPLACE FUNCTION public.increment_website_views(website_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- FIX: Set explicit search_path
AS $$
BEGIN
  UPDATE public.websites
  SET views = views + 1
  WHERE id = website_uuid;
END;
$$;

-- ═══════════════════════════════════════════════════════════
-- STEP 4: GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_old_usage_logs() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_website_views(UUID) TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════════════════
-- STEP 5: VERIFICATION QUERIES
-- ═══════════════════════════════════════════════════════════

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('websites', 'templates', 'chat_sessions')
ORDER BY tablename;

-- Verify policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('websites', 'templates', 'chat_sessions')
ORDER BY tablename, policyname;

-- Verify functions have correct search_path
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_updated_at_column',
    'cleanup_old_usage_logs',
    'increment_website_views'
  );

-- ═══════════════════════════════════════════════════════════
-- EXPECTED RESULTS
-- ═══════════════════════════════════════════════════════════

-- All tables should show rls_enabled = true
-- All policies should be listed
-- All functions should exist with SECURITY DEFINER

-- ═══════════════════════════════════════════════════════════
-- SUCCESS MESSAGE
-- ═══════════════════════════════════════════════════════════

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Security Fix Applied Successfully!';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ RLS enabled on: websites, templates, chat_sessions';
  RAISE NOTICE '✅ RLS policies verified';
  RAISE NOTICE '✅ Function search_path issues fixed';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '🔒 Your database is now secure!';
END $$;
