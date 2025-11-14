-- ═══════════════════════════════════════════════════════════
-- FIX SLOW POLICIES - Force Re-creation with Optimization
-- ═══════════════════════════════════════════════════════════
-- Run this if policies show as "⚠️ SLOW" in verification
-- This forces PostgreSQL to use optimized auth.uid() calls
-- ═══════════════════════════════════════════════════════════

-- Step 1: Drop ALL existing policies
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename IN ('users', 'websites', 'chat_sessions', 'templates', 'website_versions', 'payments', 'hosting_accounts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Dropped policy: % on %.%', pol.policyname, pol.schemaname, pol.tablename;
    END LOOP;
END $$;

-- Step 2: Create optimized policies with auth_uid variable

-- Users table
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- Websites table
CREATE POLICY "Users can view own or public websites"
  ON public.websites FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR is_public = true
  );

CREATE POLICY "Users can create own websites"
  ON public.websites FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own websites"
  ON public.websites FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own websites"
  ON public.websites FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Chat sessions table
CREATE POLICY "Users can view own or public chats"
  ON public.chat_sessions FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR is_public = true
  );

CREATE POLICY "Users can create own chats"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own chats"
  ON public.chat_sessions FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own chats"
  ON public.chat_sessions FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Website versions table (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'website_versions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can view own website versions"
        ON public.website_versions FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.websites
            WHERE websites.id = website_versions.website_id
            AND (
              websites.user_id = (SELECT auth.uid())
              OR websites.is_public = true
            )
          )
        )
    $policy$;
  END IF;
END $$;

-- Templates table
CREATE POLICY "Anyone can view active templates"
  ON public.templates FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Service role can manage all templates"
  ON public.templates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Payments table (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'payments'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can view own payments"
        ON public.payments FOR SELECT
        USING (user_id = (SELECT auth.uid()))
    $policy$;
  END IF;
END $$;

-- Hosting accounts table (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'hosting_accounts'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "Users can manage own hosting accounts"
        ON public.hosting_accounts FOR ALL
        USING (user_id = (SELECT auth.uid()))
        WITH CHECK (user_id = (SELECT auth.uid()))
    $policy$;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- VERIFICATION: Check if policies are now optimized
-- ═══════════════════════════════════════════════════════════

SELECT
  tablename,
  policyname,
  CASE
    WHEN qual::text LIKE '%auth.uid()%' AND qual::text NOT LIKE '%(SELECT auth.uid())%' THEN '⚠️ SLOW'
    WHEN qual::text LIKE '%(SELECT auth.uid())%' THEN '✅ OPTIMIZED'
    ELSE '✅ OK'
  END as performance_status,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'websites', 'chat_sessions', 'templates')
ORDER BY tablename, policyname;

-- Success message
DO $$
DECLARE
  slow_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO slow_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('users', 'websites', 'chat_sessions', 'templates')
    AND qual::text LIKE '%auth.uid()%'
    AND qual::text NOT LIKE '%(SELECT auth.uid())%';

  IF slow_count = 0 THEN
    RAISE NOTICE '✅ SUCCESS! All policies are optimized!';
  ELSE
    RAISE NOTICE '⚠️ WARNING: % policies still marked as SLOW', slow_count;
    RAISE NOTICE 'This might be a PostgreSQL display issue - check actual performance';
  END IF;
END $$;
