# ✅ Setup Checklist - WebChat.ai Production

## 🎯 Quick Start (15 minutes)

### Step 1: Apply Database Migrations (5 min)

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** → **New Query**
3. Run these migrations in order:

```bash
# Migration 1: RLS Performance (CRITICAL)
backend/src/db/migrations/optimize_rls_performance.sql

# Migration 2: Secure Chat Sessions (CRITICAL)
backend/src/db/migrations/005_secure_chat_sessions.sql
```

4. Verify both show success messages

**Expected Output:**
```
✅ RLS OPTIMIZATION COMPLETE!
🔥 PERFECT! All policies are fully optimized!

✅ SECURE CHAT SESSIONS MIGRATION COMPLETE!
🚀 Ready for production!
```

### Step 2: Verify Database State (2 min)

Run this query in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'websites', 'chat_sessions', 'templates');

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'websites', 'chat_sessions');

-- Check policies
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

**Expected:**
- ✅ 4 tables exist
- ✅ RLS is `true` for all tables
- ✅ 15+ policies active

### Step 3: Backend Environment (3 min)

Verify `backend/.env` has ALL these values:

```bash
# Required - DO NOT SKIP ANY
NODE_ENV=development
PORT=4000

# Supabase (Get from Dashboard → Settings → API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here

# JWT (Generate: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-256-bit-secret-here

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Gemini
GEMINI_API_KEY=AIza-your-gemini-key

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 4: Start Backend (2 min)

```bash
cd backend
npm install  # If not done already
npm run dev
```

**Expected Output:**
```
🚀 Server running on http://localhost:4000
✅ Supabase connected
✅ All routes loaded
```

### Step 5: Start Frontend (2 min)

```bash
cd frontend
npm install  # If not done already
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Step 6: Test Authentication Flow (1 min)

1. Open browser → `http://localhost:5173`
2. Should redirect to `/login` ✅
3. Try to access `http://localhost:5173/builder` → Should redirect to `/login` ✅
4. Create account → Should redirect to `/dashboard` ✅
5. Click "New Chat" or navigate to `/builder` → Should work ✅

---

## 🔧 What You Need to Implement (Frontend)

The backend is **100% complete**. You need to update 2 frontend files:

### File 1: `frontend/src/pages/BuilderNew.tsx`

**Add this after sending first message:**

```typescript
const response = await chatApi.sendMessage({ message, sessionId });

// 🔥 ADD THIS:
if (response.isNewSession) {
  navigate(`/builder/${response.sessionId}`, { replace: true });
}
```

### File 2: Create `frontend/src/components/chat/ChatHistorySidebar.tsx`

**Copy the component from IMPLEMENTATION_GUIDE.md** (Section 2)

That's it! Just 2 simple changes.

---

## 🎯 Test Checklist

Once you've made those 2 changes, test this flow:

### Flow 1: New Chat
- [ ] Login as user
- [ ] Go to `/builder` (URL should be `/builder`)
- [ ] Type "hi" and hit enter
- [ ] URL should change to `/builder/abc-123-xyz` ✅
- [ ] Sidebar should show "hi" chat
- [ ] Continue chatting in same session

### Flow 2: Load Existing Chat
- [ ] Click another chat in sidebar
- [ ] URL should change to `/builder/other-id`
- [ ] Should see full conversation history
- [ ] Can continue chatting

### Flow 3: New Chat Button
- [ ] Click "New Chat" in sidebar
- [ ] URL should change to `/builder`
- [ ] Empty chat interface
- [ ] First message creates new session

### Flow 4: Delete Chat
- [ ] Click delete on a chat
- [ ] Chat removed from sidebar
- [ ] If you were viewing it, redirect to `/builder`

### Flow 5: Security
- [ ] Logout
- [ ] Try to access `/builder/abc123` → Should redirect to `/login` ✅
- [ ] Login as different user → Should NOT see other user's chats ✅

---

## 🚀 Production Deployment

### Before deploying:

1. ✅ All tests pass
2. ✅ Database migrations applied to production Supabase
3. ✅ Environment variables set in production
4. ✅ CORS configured for production URL
5. ✅ SSL certificates active
6. ✅ Error logging configured

### Deploy checklist:

```bash
# Backend
cd backend
npm run build
# Deploy dist/ folder to your hosting

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to your hosting
```

---

## ⚡ Quick Reference

### API Endpoints (All require auth)

```
POST   /api/v1/chat/message           - Send message
GET    /api/v1/chat/sessions          - List chats
GET    /api/v1/chat/sessions/:id      - Load chat
DELETE /api/v1/chat/sessions/:id      - Delete chat
PATCH  /api/v1/chat/sessions/:id/archive - Archive chat
```

### Frontend Routes

```
/                     - Redirect to /dashboard
/login                - Login page
/register             - Register page
/dashboard            - User dashboard (protected)
/builder              - New chat (protected)
/builder/:id          - Existing chat (protected)
/settings             - Account settings (protected)
```

---

## 🐛 Common Issues

### "Session not found"
**Fix**: Redirect to `/builder` to start new chat

### Sidebar not updating
**Fix**: Call `chatApi.getUserSessions()` after sending message

### URL not changing
**Fix**: Implement the `navigate()` logic from Section 1

### RLS errors
**Fix**: Re-run `optimize_rls_performance.sql`

---

## 📊 Performance Metrics

After implementing everything, you should see:

- Database queries: < 50ms
- Message send: < 2s (including AI response)
- Session load: < 100ms
- Sidebar load: < 100ms
- Page load: < 1s

---

## ✅ You're Done When:

- [x] Backend runs without errors
- [x] Frontend runs without errors
- [x] Auth flow works
- [x] First message redirects to /builder/:id
- [x] Sidebar shows all chats
- [x] Can switch between chats
- [x] Can delete chats
- [x] Sessions persist across page refreshes
- [x] ChatGPT/Claude-like UX achieved!

**Total implementation time: ~30 minutes for frontend changes**

Let's go! 🚀
