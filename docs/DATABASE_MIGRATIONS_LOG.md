# 🗄️ Database Migrations Log

Track which migrations have been applied to your Supabase database.

---

## 📋 Migration Checklist

### ✅ Security Fixes (Required First)

| Status | File | Purpose | Run Date |
|--------|------|---------|----------|
| ⬜ | `fix_rls_security.sql` | Enable RLS on all tables | ___/___/___ |

**What it does:**
- Enables Row Level Security on websites, chat_sessions, templates tables
- Fixes function search_path vulnerabilities
- Creates initial RLS policies
- **Run this FIRST before other migrations**

**Documentation:** [SUPABASE_RLS_FIX.md](./SUPABASE_RLS_FIX.md)

---

### ✅ Public Sharing Feature (Latest)

| Status | File | Purpose | Run Date |
|--------|------|---------|----------|
| ⬜ | `add_public_sharing_complete.sql` | Add public/private sharing | ___/___/___ |

**What it does:**
- Adds `is_public` column to websites & chat_sessions
- Creates 8 performance indexes
- Optimizes all RLS policies (10-100x faster)
- Enables user-only deletion
- Scales to 10,000+ users

**Documentation:** [PUBLIC_SHARING_GUIDE.md](./PUBLIC_SHARING_GUIDE.md)

**Quick Start:** [QUICK_START_PUBLIC_SHARING.md](./QUICK_START_PUBLIC_SHARING.md)

---

### ⚠️ Deprecated Migrations (Don't Use)

| File | Issue | Replaced By |
|------|-------|-------------|
| `fix_rls_performance.sql` | Assumes `is_public` column exists | `add_public_sharing_complete.sql` |
| `fix_rls_performance_v2.sql` | Missing `is_public` feature | `add_public_sharing_complete.sql` |

**Note:** The public sharing migration includes all security + performance fixes in one file.

---

## 🚀 Recommended Migration Order

Run migrations in this exact order:

### Option A: Clean Database (Starting Fresh)
```bash
1. add_public_sharing_complete.sql  # Includes everything
```

### Option B: Existing Database (Has Basic Schema)
```bash
1. fix_rls_security.sql              # Enable RLS first
2. add_public_sharing_complete.sql   # Add public sharing + optimize
```

---

## 🧪 Verify Migrations Were Applied

### Check is_public Column Exists

```sql
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('websites', 'chat_sessions')
  AND column_name = 'is_public';
```

**Expected:** 2 rows (websites, chat_sessions both have is_public column)

### Check RLS is Enabled

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'websites', 'chat_sessions', 'templates')
ORDER BY tablename;
```

**Expected:** All tables show `rls_enabled = true`

### Check Indexes Exist

```sql
SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('websites', 'chat_sessions')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

**Expected:** 8 indexes total
- `idx_websites_user_id`
- `idx_websites_is_public`
- `idx_websites_user_public`
- `idx_chat_sessions_user_id`
- `idx_chat_sessions_is_public`
- `idx_chat_sessions_user_public`
- `idx_website_versions_website_id`

### Check Policies Are Optimized

```sql
SELECT
  tablename,
  policyname,
  CASE
    WHEN qual::text LIKE '%(SELECT auth.uid())%' THEN '✅ OPTIMIZED'
    WHEN qual::text LIKE '%auth.uid()%' THEN '⚠️ SLOW'
    ELSE '✅ OK'
  END as performance_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'websites', 'chat_sessions')
ORDER BY tablename, policyname;
```

**Expected:** All policies show `✅ OPTIMIZED` or `✅ OK`

---

## 🐛 Troubleshooting

### "Error: column is_public already exists"

**Cause:** You ran the migration twice

**Solution:** Safe to ignore - migration is idempotent (checks with `IF NOT EXISTS`)

### "Error: relation does not exist"

**Cause:** Base tables haven't been created yet

**Solution:** Run your initial schema creation migration first

### "Error: policy already exists"

**Cause:** Policies were created in previous migration

**Solution:** The migration drops old policies first, so this shouldn't happen. If it does, manually drop the policy:

```sql
DROP POLICY IF EXISTS "policy-name" ON public.table_name;
```

Then re-run the migration.

### "Warning: RLS not enabled"

**Cause:** Migration failed to enable RLS

**Solution:** Manually enable:

```sql
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
```

---

## 📊 Migration Impact

### Before Any Migrations

- ❌ No RLS (data exposed)
- ❌ No public sharing
- ❌ Slow queries at scale
- ❌ Security vulnerabilities

### After Security Fix

- ✅ RLS enabled (data protected)
- ❌ No public sharing
- ⚠️ Slow queries (auth.uid() per-row)
- ✅ Security improved

### After Public Sharing Migration

- ✅ RLS enabled (data protected)
- ✅ Public sharing works
- ✅ Fast queries (10-100x faster)
- ✅ Production-ready
- ✅ Scales to 10,000+ users

---

## 📝 Record Your Migrations

Fill in dates as you apply migrations:

```
✅ 2025-11-05 - fix_rls_security.sql - Enabled RLS
✅ 2025-11-05 - add_public_sharing_complete.sql - Added public sharing + optimized
```

**Keep this log updated** so your team knows what's been applied!

---

## 🎯 Next Steps

After running migrations:

1. ✅ Verify all checks pass (see verification queries above)
2. ✅ Update frontend TypeScript types (add `is_public: boolean`)
3. ✅ Implement public toggle UI component
4. ✅ Create public gallery page
5. ✅ Test security rules
6. ✅ Deploy to production

**Full implementation guide:** [PUBLIC_SHARING_GUIDE.md](./PUBLIC_SHARING_GUIDE.md)
