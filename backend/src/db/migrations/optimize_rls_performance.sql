-- ═══════════════════════════════════════════════════════════
-- OPTIMIZE RLS PERFORMANCE - Ultimate Fix (CORRECT VERSION)
-- ═══════════════════════════════════════════════════════════
-- This migration fixes slow RLS policies by:
-- 1. Adding proper indexes on user_id columns
-- 2. Using (SELECT auth.uid()) to prevent per-row evaluation
-- 3. Removing duplicate indexes
-- 4. Using covering indexes for common queries
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- STEP 1: Remove Duplicate Indexes
-- ═══════════════════════════════════════════════════════════

-- Drop old/duplicate indexes if they exist
DROP INDEX IF EXISTS public.idx_chat_sessions_is_public;
DROP INDEX IF EXISTS public.idx_websites_is_public;

DO $$
BEGIN
  RAISE NOTICE '✅ Removed duplicate indexes';
END $$;

-- ═══════════════════════════════════════════════════════════
-- STEP 2: Add Performance Indexes
-- ═══════════════════════════════════════════════════════════

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_id_auth
  ON public.users(id)
  WHERE id IS NOT NULL;

-- Websites table indexes
CREATE INDEX IF NOT EXISTS idx_websites_user_id
  ON public.websites(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_websites_user_public
  ON public.websites(user_id, is_public)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_websites_public
  ON public.websites(is_public)
  WHERE is_public = true;

-- Chat sessions indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id
  ON public.chat_sessions(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_public
  ON public.chat_sessions(user_id, is_public)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_public
  ON public.chat_sessions(is_public)
  WHERE is_public = true;

-- Templates indexes
CREATE INDEX IF NOT EXISTS idx_templates_active
  ON public.templates(is_active)
  WHERE is_active = true;

-- Website versions indexes (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'website_versions'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_website_versions_website_id
             ON public.website_versions(website_id)
             WHERE website_id IS NOT NULL';
  END IF;
END $$;

-- Payments indexes (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_payments_user_id
             ON public.payments(user_id)
             WHERE user_id IS NOT NULL';
  END IF;
END $$;

-- Hosting accounts indexes (if table exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'hosting_accounts'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_hosting_accounts_user_id
             ON public.hosting_accounts(user_id)
             WHERE user_id IS NOT NULL';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ Indexes created successfully';
END $$;

-- ═══════════════════════════════════════════════════════════
-- STEP 3: Drop ALL Existing Policies
-- ═══════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════
-- STEP 4: Create Optimized Policies with (SELECT auth.uid())
-- ═══════════════════════════════════════════════════════════

-- Users table - (SELECT auth.uid()) prevents per-row evaluation
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- Websites table - Optimized with indexes and (SELECT auth.uid())
CREATE POLICY "websites_select_own_or_public"
  ON public.websites FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR is_public = true);

CREATE POLICY "websites_insert_own"
  ON public.websites FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "websites_update_own"
  ON public.websites FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "websites_delete_own"
  ON public.websites FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Chat sessions table - Optimized with indexes and (SELECT auth.uid())
CREATE POLICY "chat_sessions_select_own_or_public"
  ON public.chat_sessions FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR is_public = true);

CREATE POLICY "chat_sessions_insert_own"
  ON public.chat_sessions FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "chat_sessions_update_own"
  ON public.chat_sessions FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "chat_sessions_delete_own"
  ON public.chat_sessions FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Website versions table - Optimized join with (SELECT auth.uid())
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'website_versions'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "website_versions_select_own_or_public"
        ON public.website_versions FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM public.websites w
            WHERE w.id = website_versions.website_id
            AND (w.user_id = (SELECT auth.uid()) OR w.is_public = true)
          )
        );

      CREATE POLICY "website_versions_insert_own"
        ON public.website_versions FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM public.websites w
            WHERE w.id = website_versions.website_id
            AND w.user_id = (SELECT auth.uid())
          )
        );
    $policy$;
    RAISE NOTICE '✅ Website versions policies created';
  END IF;
END $$;

-- Templates table - Simple and fast
CREATE POLICY "templates_select_active"
  ON public.templates FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "templates_all_service_role"
  ON public.templates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Payments table - Direct comparison with (SELECT auth.uid())
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'payments'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "payments_select_own"
        ON public.payments FOR SELECT
        USING (user_id = (SELECT auth.uid()));

      CREATE POLICY "payments_insert_own"
        ON public.payments FOR INSERT
        WITH CHECK (user_id = (SELECT auth.uid()));
    $policy$;
    RAISE NOTICE '✅ Payments policies created';
  END IF;
END $$;

-- Hosting accounts table - Full access for own records with (SELECT auth.uid())
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'hosting_accounts'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "hosting_accounts_all_own"
        ON public.hosting_accounts FOR ALL
        USING (user_id = (SELECT auth.uid()))
        WITH CHECK (user_id = (SELECT auth.uid()));
    $policy$;
    RAISE NOTICE '✅ Hosting accounts policies created';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- STEP 5: Analyze Tables for Better Query Planning
-- ═══════════════════════════════════════════════════════════

ANALYZE public.users;
ANALYZE public.websites;
ANALYZE public.chat_sessions;
ANALYZE public.templates;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'website_versions') THEN
    EXECUTE 'ANALYZE public.website_versions';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payments') THEN
    EXECUTE 'ANALYZE public.payments';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hosting_accounts') THEN
    EXECUTE 'ANALYZE public.hosting_accounts';
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════
-- STEP 6: Verification and Performance Check
-- ═══════════════════════════════════════════════════════════

-- Check indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('users', 'websites', 'chat_sessions', 'templates')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check policies
SELECT
  tablename,
  policyname,
  cmd as operation,
  qual::text as using_expression,
  with_check::text as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'websites', 'chat_sessions', 'templates')
ORDER BY tablename, cmd, policyname;

-- Performance status report
DO $$
DECLARE
  policy_count INTEGER;
  index_count INTEGER;
  slow_policy_count INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('users', 'websites', 'chat_sessions', 'templates');

  -- Count indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND tablename IN ('users', 'websites', 'chat_sessions', 'templates')
    AND indexname LIKE 'idx_%';

  -- Count potentially slow policies (without SELECT wrapper)
  SELECT COUNT(*) INTO slow_policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('users', 'websites', 'chat_sessions', 'templates')
    AND (
      qual::text LIKE '%auth.uid()%'
      AND qual::text NOT LIKE '%(SELECT auth.uid())%'
      OR with_check::text LIKE '%auth.uid()%'
      AND with_check::text NOT LIKE '%(SELECT auth.uid())%'
    );

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ RLS OPTIMIZATION COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Policies created: %', policy_count;
  RAISE NOTICE 'Performance indexes: %', index_count;
  RAISE NOTICE 'Slow policies detected: %', slow_policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Performance improvements:';
  RAISE NOTICE '  • (SELECT auth.uid()) prevents per-row evaluation ✅';
  RAISE NOTICE '  • Indexed user_id columns ✅';
  RAISE NOTICE '  • Optimized OR conditions with covering indexes ✅';
  RAISE NOTICE '  • Duplicate indexes removed ✅';
  RAISE NOTICE '  • Table statistics updated ✅';
  RAISE NOTICE '';

  IF slow_policy_count = 0 THEN
    RAISE NOTICE '🔥 PERFECT! All policies are fully optimized!';
    RAISE NOTICE 'Supabase Advisor should show NO performance warnings now!';
  ELSE
    RAISE NOTICE '⚠️  WARNING: % policies may still need optimization', slow_policy_count;
  END IF;

  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
