# 🔒 SUPABASE RLS SECURITY FIX

**Problem:** Row Level Security (RLS) policies exist but RLS is not enabled on tables.
**Impact:** 🚨 **CRITICAL SECURITY ISSUE** - Your data is currently unprotected!
**Time to Fix:** 2 minutes

---

## ⚠️ What's Wrong?

Your Supabase dashboard shows these warnings:

```
❌ Table `public.chat_sessions` is public, but RLS has not been enabled.
❌ Table `public.websites` is public, but RLS has not been enabled.
❌ Table `public.templates` is public, but RLS has not been enabled.
⚠️ Functions have mutable search_path (security risk)
```

**This means:** Anyone can read/write ALL data in these tables! 😱

---

## ✅ How to Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Fix SQL

1. Open this file: [`backend/src/db/migrations/fix_rls_security.sql`](../backend/src/db/migrations/fix_rls_security.sql)
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Success

You should see:

```
✅ RLS Security Fix Applied Successfully!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ RLS enabled on: websites, templates, chat_sessions
✅ RLS policies verified
✅ Function search_path issues fixed
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 Your database is now secure!
```

### Step 4: Verify No More Warnings

1. Go to **Database** > **Tables** in Supabase
2. Click on each table (websites, templates, chat_sessions)
3. Warnings should be GONE! ✅

---

## 🔍 What This Fix Does

### 1. Enables RLS on All Tables

```sql
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
```

**Result:** Tables are now protected by RLS policies

### 2. Verifies RLS Policies Exist

Your policies (already created):

**Websites:**
- ✅ Users can view own or public websites
- ✅ Users can create own websites
- ✅ Users can update own websites
- ✅ Users can delete own websites

**Templates:**
- ✅ Everyone can view active templates
- ✅ Service role can manage templates

**Chat Sessions:**
- ✅ Users can view their own chat sessions
- ✅ Users can manage own chat sessions

### 3. Fixes Function Security

Before:
```sql
-- ❌ INSECURE: Mutable search_path
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
```

After:
```sql
-- ✅ SECURE: Fixed search_path
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public  -- Explicit path
AS $$
```

**Result:** Functions can't be exploited with search_path attacks

---

## 🧪 Testing After Fix

### Test 1: User Can Only See Own Websites

```sql
-- Login as user_1
SELECT * FROM websites;
-- Should only show websites where user_id = current user

-- Login as user_2
SELECT * FROM websites;
-- Should show different set of websites
```

### Test 2: User Can't Delete Others' Websites

```sql
-- Try to delete someone else's website
DELETE FROM websites WHERE user_id != auth.uid();
-- Should fail with permission error ✅
```

### Test 3: Anonymous Can View Templates

```sql
-- Without authentication
SELECT * FROM templates WHERE is_active = true;
-- Should work ✅

SELECT * FROM templates WHERE is_active = false;
-- Should return no results ✅
```

---

## 📊 Before vs After

### Before (INSECURE)

| Table | RLS Enabled | Policies | Protected |
|-------|-------------|----------|-----------|
| websites | ❌ NO | Yes | ❌ NO |
| templates | ❌ NO | Yes | ❌ NO |
| chat_sessions | ❌ NO | Yes | ❌ NO |

**Result:** Anyone can access ALL data! 😱

### After (SECURE)

| Table | RLS Enabled | Policies | Protected |
|-------|-------------|----------|-----------|
| websites | ✅ YES | Yes | ✅ YES |
| templates | ✅ YES | Yes | ✅ YES |
| chat_sessions | ✅ YES | Yes | ✅ YES |

**Result:** Data is protected by RLS policies! 🔒

---

## ❓ FAQ

### Q: Will this break my app?

**A:** No! Your policies already exist. We're just **enabling** them.

### Q: What if I get errors?

**A:** Check these common issues:

1. **"relation does not exist"**
   - Make sure tables exist in your database
   - Run table creation migrations first

2. **"policy already exists"**
   - This is OK! The script handles this
   - Policies won't be duplicated

3. **"permission denied"**
   - Make sure you're logged in as database owner
   - Or use service role key

### Q: Can I roll back?

**A:** Yes, to disable RLS:

```sql
-- WARNING: Only do this for testing!
ALTER TABLE public.websites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
```

**⚠️ But don't do this in production!**

### Q: Do I need to restart my app?

**A:** No, changes take effect immediately.

---

## 🔐 Security Best Practices

After fixing RLS, also:

### 1. Use Environment Variables

Never expose your keys:

```bash
# ✅ GOOD - Use anon key in frontend
VITE_SUPABASE_ANON_KEY=eyJ...

# ❌ BAD - Never expose service role key!
# VITE_SUPABASE_SERVICE_KEY=eyJ...  # DON'T DO THIS
```

### 2. Use Service Role Only in Backend

```typescript
// ✅ Backend - Can use service role
const supabase = createClient(url, SERVICE_ROLE_KEY);

// ✅ Frontend - Use anon key
const supabase = createClient(url, ANON_KEY);
```

### 3. Test Your Policies

```typescript
// Test as authenticated user
const { data, error } = await supabase
  .from('websites')
  .select('*');

// Should only return user's websites ✅
```

### 4. Monitor Database Logs

In Supabase:
- Go to **Logs** > **Postgres Logs**
- Watch for unauthorized access attempts
- Review policy violations

---

## ✅ Verification Checklist

After running the fix, verify:

- [ ] RLS enabled on `websites` table
- [ ] RLS enabled on `templates` table
- [ ] RLS enabled on `chat_sessions` table
- [ ] No more warnings in Supabase dashboard
- [ ] Functions have fixed search_path
- [ ] App still works correctly
- [ ] Users can only see their own data
- [ ] Anonymous users can view public templates

---

## 🚨 If You Skip This Fix

**Consequences:**

1. **Any user can see all websites** (including private ones)
2. **Any user can delete others' websites**
3. **Any user can modify others' data**
4. **Function exploits are possible** (search_path attacks)
5. **GDPR/Privacy violations**
6. **Supabase may disable your project**

**Time to hack your database:** < 5 minutes
**Time to fix it properly:** 2 minutes

**The choice is clear!** 😉

---

## 📝 Summary

**What to do:**
1. Copy SQL from `fix_rls_security.sql`
2. Run in Supabase SQL Editor
3. Verify warnings are gone
4. Test your app

**Result:**
- ✅ Database is secure
- ✅ RLS policies active
- ✅ Function security fixed
- ✅ No more warnings
- ✅ Sleep well at night! 😴

---

**Fix this NOW before going to production!** 🔒

For questions, check the SQL file comments or review RLS docs:
https://supabase.com/docs/guides/auth/row-level-security
