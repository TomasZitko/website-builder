# 🚀 Production Architecture Setup Guide

## ✅ What's Been Built

I've created a complete production-grade system with:

### Backend Services ✅
- [backend/src/services/deployment.service.ts](backend/src/services/deployment.service.ts) - Cloudflare Pages deployment
- [backend/src/services/analytics.service.ts](backend/src/services/analytics.service.ts) - Privacy-focused analytics
- [backend/src/services/image.service.ts](backend/src/services/image.service.ts) - Image upload for chat
- [backend/src/services/wedos.service.ts](backend/src/services/wedos.service.ts) - Wedos API & FTP integration
- [backend/src/types/production.types.ts](backend/src/types/production.types.ts) - TypeScript types

### Database Schema ✅
- [backend/src/db/migrations/006_production_architecture.sql](backend/src/db/migrations/006_production_architecture.sql) - Production tables

### Documentation ✅
- [PRODUCTION_ARCHITECTURE.md](PRODUCTION_ARCHITECTURE.md) - Complete architecture guide (977 lines)

---

## 📋 Setup Steps

### Step 1: Run Database Migration

The database schema needs to be applied to your Supabase database.

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Open [backend/src/db/migrations/006_production_architecture.sql](backend/src/db/migrations/006_production_architecture.sql)
5. Copy the entire SQL content
6. Paste into Supabase SQL Editor
7. Click "Run" (or press Ctrl+Enter)
8. Wait for success message showing:
   ```
   ✅ PRODUCTION ARCHITECTURE MIGRATION COMPLETE!
   New tables created: 4
   RLS policies added: [number]
   ```

**Option B: Via psql CLI**

```bash
# Set your database URL
DATABASE_URL="postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres"

# Run migration
psql $DATABASE_URL < backend/src/db/migrations/006_production_architecture.sql
```

### Step 2: Create Supabase Storage Bucket

```bash
# In Supabase Dashboard:
1. Go to Storage
2. Click "Create bucket"
3. Name: "website-images"
4. Public: YES
5. Click "Create bucket"

# Set permissions (in SQL Editor):
```

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'website-images' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'website-images'
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own images
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'website-images'
  AND auth.role() = 'authenticated'
);
```

### Step 3: Install Additional Dependencies

```bash
cd backend
npm install basic-ftp multer @types/multer ua-parser-js form-data
```

### Step 4: Update Environment Variables

Add to [backend/.env](backend/.env:1):

```bash
# Wedos API (Optional - for domain registration)
WEDOS_API_USER=your-wedos-username
WEDOS_API_KEY=your-wedos-password

# Cloudflare Pages (Optional - for subdomain hosting)
CLOUDFLARE_ACCOUNT_ID=your-cf-account-id
CLOUDFLARE_API_TOKEN=your-cf-api-token
CLOUDFLARE_PROJECT_NAME=webchat-sites

# Image Storage
SUPABASE_STORAGE_BUCKET=website-images
MAX_IMAGE_SIZE_MB=10

# Analytics
IP_HASH_SALT=random-salt-for-ip-hashing

# Encryption (for Wedos FTP passwords)
ENCRYPTION_KEY=generate-32-byte-hex-key-here
```

**Generate encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 5: Verify Migration Success

Run this SQL in Supabase SQL Editor to verify:

```sql
-- Check new tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'website_analytics',
    'website_images',
    'deployments',
    'domain_verifications'
  );

-- Should return 4 rows

-- Check websites table has new columns
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'websites'
  AND column_name IN (
    'subdomain',
    'deployment_status',
    'deployment_url',
    'total_views',
    'unique_visitors'
  );

-- Should return 5 rows
```

---

## 🎨 Frontend Setup

### Step 1: Install Frontend Dependencies

```bash
cd frontend
npm install @tanstack/react-table recharts date-fns lucide-react
```

### Step 2: Update API Client

The backend is ready. Frontend just needs to call these new endpoints:

```typescript
// Image upload
POST /api/v1/websites/:id/images
Content-Type: multipart/form-data

// Deploy website
POST /api/v1/websites/:id/deploy
{
  "provider": "internal" | "wedos",
  "changeSummary": "What changed"
}

// Get analytics
GET /api/v1/websites/:id/analytics?period=30d

// Get deployments (version history)
GET /api/v1/websites/:id/deployments

// Setup custom domain
POST /api/v1/websites/:id/domain
{
  "domain": "example.com"
}

// Verify domain
POST /api/v1/websites/:id/domain/verify
```

---

## 🧪 Testing

### Test Image Upload

```bash
# Create a test image
curl -X POST http://localhost:4000/api/v1/websites/[website-id]/images \
  -H "Authorization: Bearer [your-token]" \
  -F "image=@test-image.jpg"
```

### Test Deployment

```bash
# Deploy to subdomain (Cloudflare Pages)
curl -X POST http://localhost:4000/api/v1/websites/[website-id]/deploy \
  -H "Authorization: Bearer [your-token]" \
  -H "Content-Type: application/json" \
  -d '{"provider":"internal","changeSummary":"Initial deployment"}'
```

### Test Analytics

```bash
# Track a visit (simulated)
curl -X POST http://localhost:4000/api/v1/analytics/track \
  -H "Content-Type: application/json" \
  -d '{
    "website_id": "[website-id]",
    "page_url": "https://test.webchat.cz",
    "referrer": "direct",
    "user_agent": "Mozilla/5.0..."
  }'

# Get analytics
curl -X GET http://localhost:4000/api/v1/websites/[website-id]/analytics?period=7d \
  -H "Authorization: Bearer [your-token]"
```

---

## 🔐 Security Checklist

- [ ] Database migration applied successfully
- [ ] RLS policies active on all new tables
- [ ] Storage bucket created with correct permissions
- [ ] Encryption key generated and stored securely
- [ ] IP hash salt configured
- [ ] Wedos credentials encrypted before storage
- [ ] Rate limiting enabled on image upload endpoints
- [ ] File upload validation active (max size, allowed types)
- [ ] Analytics scripts don't use cookies (GDPR compliant)

---

## 📊 What You Get

After setup, you'll have:

### Multi-Website Dashboard
- ✅ List all user websites (Vercel-style cards)
- ✅ Preview images
- ✅ Deployment status (draft/live/failed)
- ✅ Analytics summary (views, visitors)
- ✅ Quick actions (Edit, Deploy, Analytics, Delete)

### Deployment System
- ✅ **Tier 1 (Free):** Subdomain hosting (username.webchat.cz) via Cloudflare Pages
- ✅ **Tier 2 (Paid):** Custom domain (user.com) CNAME to our servers
- ✅ **Tier 3 (Advanced):** Wedos FTP deployment to user's hosting

### Analytics
- ✅ Privacy-focused (no cookies, hashed IPs)
- ✅ Page views & unique visitors
- ✅ Device breakdown (desktop/mobile/tablet)
- ✅ Top pages & referrers
- ✅ Geographic data (country/city)
- ✅ Timeline charts

### Image Management
- ✅ Drag & drop images in chat
- ✅ AI references images in code generation
- ✅ Automatic optimization (future)
- ✅ Usage tracking
- ✅ Cleanup unused images

### Version Control
- ✅ Every deployment creates a version
- ✅ Code snapshots (HTML/CSS/JS)
- ✅ Change summaries
- ✅ Rollback capability
- ✅ Deployment history

---

## 🐛 Troubleshooting

### Migration Fails

**Error:** "relation already exists"

**Solution:** Some tables might already exist. Run this to check:

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

If tables exist but columns are missing, run the ALTER TABLE commands separately.

### Image Upload Fails

**Error:** "Bucket not found"

**Solution:**
1. Create the bucket in Supabase Dashboard > Storage
2. Set bucket name in .env: `SUPABASE_STORAGE_BUCKET=website-images`
3. Make sure bucket is public

### Deployment Fails

**Error:** "Cloudflare API credentials not configured"

**Solution:** The system falls back to Supabase Storage. To use Cloudflare Pages:
1. Create Cloudflare account
2. Get API token from Cloudflare dashboard
3. Add to .env: `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`

### Wedos Integration Fails

**Error:** "WAPI credentials not configured"

**Solution:** Wedos integration is optional. For testing:
- Use "internal" provider (Cloudflare Pages)
- Wedos is only needed for Tier 3 (advanced users with Wedos hosting)

---

## 🚀 Next Steps

1. **Run the migration** (Step 1 above)
2. **Create storage bucket** (Step 2 above)
3. **Install dependencies** (Step 3 above)
4. **Test backend endpoints** (see Testing section)
5. **Build dashboard UI** (I'll provide components next)
6. **Deploy to production** (Docker + GitHub Actions ready)

---

## 📞 Questions to Answer

Before I build the frontend dashboard, please answer:

1. **Hosting Provider:** Which do you prefer?
   - Cloudflare Pages (free, fast, recommended)
   - Vercel (easy, but more expensive)
   - Self-hosted (full control, more setup)

2. **Default Domain:** What should the free subdomain be?
   - `username.webchat.cz`
   - `username.webchat.ai`
   - Custom?

3. **Paid Features:** What requires payment?
   - Custom domains only?
   - Custom domains + extra sites?
   - All-in-one subscription?

4. **Wedos Priority:** How important is Wedos integration?
   - Critical (many Czech users)
   - Nice-to-have (advanced feature)
   - Low priority (skip for MVP)

Once you answer, I'll build the frontend dashboard and connect everything! 🔥
