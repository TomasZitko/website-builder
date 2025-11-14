# Database Setup Guide - WebChat.ai

This guide walks you through setting up the PostgreSQL database using Supabase for the WebChat.ai application.

## Table of Contents

1. [Overview](#overview)
2. [Create Supabase Project](#create-supabase-project)
3. [Run Database Migration](#run-database-migration)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Verify Setup](#verify-setup)
6. [Database Schema](#database-schema)
7. [Security (RLS)](#security-rls)
8. [Troubleshooting](#troubleshooting)

---

## Overview

WebChat.ai uses **PostgreSQL** as the database, hosted on **Supabase** (a managed PostgreSQL service with built-in features like authentication, Row Level Security, and real-time subscriptions).

### What's Included

- **8 Tables**: `users`, `websites`, `website_versions`, `chat_sessions`, `payments`, `templates`, `hosting_accounts`, `usage_logs`
- **Row Level Security (RLS)**: Users can only access their own data
- **Indexes**: Optimized queries for performance
- **Triggers**: Auto-update timestamps, increment view counts
- **Helper Functions**: Encryption, usage cleanup, analytics

---

## Create Supabase Project

### Step 1: Sign Up / Log In

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in with your GitHub account

### Step 2: Create New Project

1. Click **"New Project"**
2. Fill in project details:
   - **Name**: `webchat-production` (or any name you prefer)
   - **Database Password**: Generate a strong password (**SAVE THIS!**)
   - **Region**: Choose closest to your users (e.g., `Europe Central` for Czech Republic)
   - **Pricing Plan**: Start with Free tier

3. Click **"Create new project"**
4. Wait 2-3 minutes for project initialization

### Step 3: Get Database Credentials

Once the project is ready:

1. Go to **Project Settings** → **Database**
2. Copy the following:
   - **Connection String** (URI format)
   - **Project URL** (API URL)

3. Go to **Project Settings** → **API**
4. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role** key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` ⚠️ **Keep this secret!**

---

## Run Database Migration

### Step 1: Open SQL Editor

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**

### Step 2: Copy Migration SQL

1. Open the migration file:
   ```
   backend/src/db/migrations/001_initial.sql
   ```

2. Copy the **entire contents** of the file

### Step 3: Run Migration

1. Paste the SQL into the Supabase SQL Editor
2. Click **"Run"** (or press `Ctrl + Enter`)
3. Wait for execution to complete

### Step 4: Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see all 8 tables:
   - ✅ `users`
   - ✅ `websites`
   - ✅ `website_versions`
   - ✅ `chat_sessions`
   - ✅ `payments`
   - ✅ `templates`
   - ✅ `hosting_accounts`
   - ✅ `usage_logs`

3. Click on each table to verify columns are created correctly

---

## Configure Environment Variables

### Backend Configuration

1. Navigate to `backend/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and update:

   ```env
   # Database
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... (your service_role key)

   # Encryption (generate a 32-byte key)
   ENCRYPTION_KEY=your-64-character-hex-key-here
   ```

4. Generate encryption key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and paste it as `ENCRYPTION_KEY`

### Frontend Configuration

1. Navigate to `frontend/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and update:

   ```env
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey... (your anon key)
   ```

---

## Verify Setup

### Test Backend Connection

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. You should see:
   ```
   🚀 Server running on http://localhost:4000
   📝 Environment: development
   ✅ Database connection successful
   ```

3. Test the health endpoint:
   ```bash
   curl http://localhost:4000/health
   ```

   Expected response:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2025-10-18T...",
     "environment": "development"
   }
   ```

### Verify Database Structure

Run this query in Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see all 8 tables listed.

---

## Database Schema

### Tables Overview

| Table | Description |
|-------|-------------|
| `users` | User accounts with authentication and subscription info |
| `websites` | Generated websites with code and metadata |
| `website_versions` | Version history for undo/redo functionality |
| `chat_sessions` | AI conversation history |
| `payments` | Stripe payment records |
| `templates` | Pre-built website templates |
| `hosting_accounts` | User FTP credentials (encrypted) |
| `usage_logs` | API usage tracking for rate limiting |

### Key Relationships

```
users (1) ----< (many) websites
websites (1) ----< (many) website_versions
websites (1) ----< (many) chat_sessions
users (1) ----< (many) payments
users (1) ----< (many) hosting_accounts
```

---

## Security (RLS)

Row Level Security (RLS) is enabled on **all tables** to ensure users can only access their own data.

### Policies Summary

- **Users**: Can only view/update their own profile
- **Websites**: Can view own websites + published websites (public)
- **Website Versions**: Can only view versions of their own websites
- **Chat Sessions**: Can only manage their own chat sessions
- **Payments**: Can only view their own payments
- **Templates**: Everyone can view active templates
- **Hosting Accounts**: Can only manage their own accounts

### Testing RLS

To test that RLS is working:

1. Try to access another user's data (should fail)
2. Try to access your own data (should succeed)
3. Try to view published websites (should succeed even if not owner)

---

## Troubleshooting

### Issue: "Missing Supabase credentials"

**Solution**: Make sure `.env` file exists in `backend/` with correct values:
```bash
cd backend
cat .env | grep SUPABASE
```

### Issue: "Database connection failed"

**Solution**: Check that:
1. Supabase project is running (not paused)
2. `SUPABASE_URL` is correct
3. `SUPABASE_SERVICE_KEY` is the **service_role** key (not anon key)
4. No typos in environment variables

### Issue: "relation 'users' does not exist"

**Solution**: Migration hasn't been run yet. Go to Supabase SQL Editor and run `001_initial.sql`.

### Issue: "RLS policies blocking everything"

**Solution**: Make sure you're using the **service_role** key in the backend (it bypasses RLS). The anon key should only be used in the frontend.

### Issue: SQL migration fails with syntax error

**Solution**:
1. Make sure you copied the **entire** SQL file
2. Check that you're using Supabase SQL Editor (not psql)
3. Run migrations one section at a time to identify the problematic query

### Issue: "Cannot encrypt/decrypt FTP passwords"

**Solution**: Generate a valid encryption key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy output to `.env` as `ENCRYPTION_KEY` (should be 64 hex characters).

---

## Next Steps

After database setup is complete:

1. ✅ Database schema created
2. ✅ Environment variables configured
3. ✅ Connection verified

**You're ready for:**
- **PROMPT 1.3**: Authentication System
- **PROMPT 1.4**: UI Component Library
- **PROMPT 2.1**: Chat Interface

---

## Useful Commands

```bash
# Check database connection
curl http://localhost:4000/health

# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# View migration status (after implementing)
npm run migrate:status

# Restart backend
cd backend && npm run dev
```

---

## Database Helper Functions

The following helper functions are available in [`backend/src/db/helpers.ts`](../backend/src/db/helpers.ts):

- `getUserByEmail(email)` - Find user by email
- `createUser(userData)` - Create new user
- `createWebsite(websiteData)` - Create new website
- `getWebsitesByUserId(userId)` - Get all user websites
- `createWebsiteVersion(...)` - Save website version
- `logUsage(logData)` - Log API usage
- `encrypt(text)` / `decrypt(text)` - Encrypt/decrypt sensitive data

Example usage:

```typescript
import { createWebsite, getUserByEmail } from './db/helpers'

const user = await getUserByEmail('user@example.com')
const website = await createWebsite({
  user_id: user.id,
  name: 'My Website',
  html_code: '<html>...</html>'
})
```

---

**Need help?** Check the main [README.md](../README.md) or review the [CLAUDE.md](../CLAUDE.md) instructions.
