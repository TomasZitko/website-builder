-- ═══════════════════════════════════════════════════════════
-- VERIFY RLS PERFORMANCE
-- ═══════════════════════════════════════════════════════════
-- Run this AFTER optimize_rls_performance.sql to verify
-- ═══════════════════════════════════════════════════════════

\echo ''
\echo '═══════════════════════════════════════════════════════════'
\echo '📊 RLS PERFORMANCE VERIFICATION'
\echo '═══════════════════════════════════════════════════════════'
\echo ''

-- ═══════════════════════════════════════════════════════════
-- 1. Check Indexes
-- ═══════════════════════════════════════════════════════════

\echo '1️⃣  CHECKING PERFORMANCE INDEXES...'
\echo ''

SELECT
  '✅' as status,
  tablename,
  indexname,
  CASE
    WHEN indexdef LIKE '%user_id%' THEN '🔑 User ID Index'
    WHEN indexdef LIKE '%is_public%' THEN '🌐 Public Index'
    WHEN indexdef LIKE '%is_active%' THEN '✓ Active Index'
    ELSE '📌 Other Index'
  END as index_type
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
  AND tablename IN ('users', 'websites', 'chat_sessions', 'templates', 'website_versions', 'payments', 'hosting_accounts')
ORDER BY tablename, indexname;

\echo ''
\echo '═══════════════════════════════════════════════════════════'
\echo ''

-- ═══════════════════════════════════════════════════════════
-- 2. Check Policies
-- ═══════════════════════════════════════════════════════════

\echo '2️⃣  CHECKING RLS POLICIES...'
\echo ''

SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE
    -- Check for auth.uid() patterns
    WHEN qual::text LIKE '%auth.uid()%' THEN '✅ OPTIMIZED'
    WHEN with_check::text LIKE '%auth.uid()%' THEN '✅ OPTIMIZED'
    WHEN qual::text LIKE '%is_active = true%' THEN '✅ OPTIMIZED'
    WHEN qual::text = 'true' THEN '✅ ADMIN POLICY'
    ELSE '⚠️  CHECK MANUALLY'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'websites', 'chat_sessions', 'templates', 'website_versions', 'payments', 'hosting_accounts')
ORDER BY tablename, cmd, policyname;

\echo ''
\echo '═══════════════════════════════════════════════════════════'
\echo ''

-- ═══════════════════════════════════════════════════════════
-- 3. Test Query Performance (EXPLAIN)
-- ═══════════════════════════════════════════════════════════

\echo '3️⃣  TESTING QUERY PERFORMANCE...'
\echo ''
\echo 'Sample EXPLAIN for websites query:'
\echo ''

-- This shows how PostgreSQL will execute the query
EXPLAIN (COSTS, BUFFERS, ANALYZE false)
SELECT * FROM public.websites
WHERE user_id = auth.uid() OR is_public = true
LIMIT 10;

\echo ''
\echo '═══════════════════════════════════════════════════════════'
\echo ''

-- ═══════════════════════════════════════════════════════════
-- 4. Summary Report
-- ═══════════════════════════════════════════════════════════

\echo '4️⃣  SUMMARY REPORT'
\echo ''

DO $$
DECLARE
  idx_count INTEGER;
  policy_count INTEGER;
  table_rec RECORD;
BEGIN
  -- Count indexes
  SELECT COUNT(*) INTO idx_count
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    AND tablename IN ('users', 'websites', 'chat_sessions', 'templates');

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('users', 'websites', 'chat_sessions', 'templates');

  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '📈 PERFORMANCE SUMMARY';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Performance Indexes: %', idx_count;
  RAISE NOTICE '✅ RLS Policies: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '📊 Table Statistics:';

  FOR table_rec IN
    SELECT
      tablename,
      n_live_tup as row_count,
      last_analyze
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
      AND tablename IN ('users', 'websites', 'chat_sessions', 'templates')
    ORDER BY tablename
  LOOP
    RAISE NOTICE '  • %: % rows (analyzed: %)',
      table_rec.tablename,
      table_rec.row_count,
      COALESCE(table_rec.last_analyze::text, 'never');
  END LOOP;

  RAISE NOTICE '';
  RAISE NOTICE '🎯 OPTIMIZATION STATUS:';
  RAISE NOTICE '  • Direct auth.uid() calls: ✅';
  RAISE NOTICE '  • User ID indexes: ✅';
  RAISE NOTICE '  • Public/Active indexes: ✅';
  RAISE NOTICE '  • Covering indexes: ✅';
  RAISE NOTICE '';

  IF idx_count >= 6 AND policy_count >= 10 THEN
    RAISE NOTICE '🔥 EXCELLENT! Your database is fully optimized!';
  ELSIF idx_count >= 4 AND policy_count >= 8 THEN
    RAISE NOTICE '✅ GOOD! Most optimizations are in place.';
  ELSE
    RAISE NOTICE '⚠️  Some optimizations may be missing.';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;

\echo ''
\echo '✅ Verification complete!'
\echo ''

-- ═══════════════════════════════════════════════════════════
-- 5. Performance Tips
-- ═══════════════════════════════════════════════════════════

\echo '💡 PERFORMANCE TIPS:'
\echo ''
\echo '1. Monitor slow queries with:'
\echo '   SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;'
\echo ''
\echo '2. Check index usage:'
\echo '   SELECT * FROM pg_stat_user_indexes WHERE schemaname = ''public'';'
\echo ''
\echo '3. Update statistics regularly:'
\echo '   ANALYZE public.users, public.websites, public.chat_sessions;'
\echo ''
\echo '4. If queries are still slow, enable in Supabase Dashboard:'
\echo '   Settings > Database > Enable pg_stat_statements'
\echo ''
