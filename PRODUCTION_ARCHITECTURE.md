# 🏗️ WebChat.ai - Production Architecture (2025 Standard)

## 🎯 Product Vision

**One-click website builder with AI chat interface and automated deployment to custom domains.**

### Target Users:
1. **Individual business owners** - Build one website, deploy to custom domain
2. **Freelancers/Agencies** - Build websites for multiple clients

### Core Flow:
```
Sign Up → Chat with AI → Website Generated → Deploy to Domain → Edit via Chat → Live Updates
```

---

## 🗄️ DATABASE ARCHITECTURE

### Updated Schema

```sql
-- Enhanced websites table
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Code Storage
  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,

  -- Deployment
  subdomain VARCHAR(100) UNIQUE,  -- e.g., 'tomas' -> tomas.webchat.cz
  custom_domain VARCHAR(255),      -- e.g., 'tomas.cz'
  custom_domain_verified BOOLEAN DEFAULT FALSE,
  ssl_enabled BOOLEAN DEFAULT FALSE,

  -- Hosting Status
  deployment_status VARCHAR(20) DEFAULT 'draft',  -- draft, deploying, live, failed
  deployment_provider VARCHAR(20) DEFAULT 'internal',  -- internal, wedos, custom
  deployed_at TIMESTAMP,
  last_deployed_at TIMESTAMP,
  deployment_url TEXT,  -- Full URL where site is accessible

  -- Wedos Integration
  wedos_service_id VARCHAR(100),   -- Wedos hosting service ID
  wedos_domain_id VARCHAR(100),    -- Wedos domain ID
  wedos_ftp_path TEXT,             -- FTP path on Wedos

  -- Analytics
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,

  -- Metadata
  theme VARCHAR(50),
  color_scheme JSONB,
  preview_image_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,

  -- Payment (for custom domains)
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP,
  payment_amount DECIMAL(10, 2),
  subscription_status VARCHAR(20) DEFAULT 'none',  -- none, active, expired

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_subdomain_per_user UNIQUE (user_id, subdomain),
  CHECK (deployment_status IN ('draft', 'deploying', 'live', 'failed', 'archived')),
  CHECK (deployment_provider IN ('internal', 'wedos', 'custom'))
);

-- Website Analytics Table
CREATE TABLE website_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,

  -- Visit Data
  visitor_ip VARCHAR(45),
  visitor_country VARCHAR(2),
  visitor_city VARCHAR(100),

  -- Page Data
  page_url TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,

  -- Device Info
  device_type VARCHAR(20),  -- desktop, mobile, tablet
  browser VARCHAR(50),
  os VARCHAR(50),

  -- Timing
  visited_at TIMESTAMP DEFAULT NOW(),
  session_duration INTEGER,  -- seconds

  -- Indexes
  INDEX idx_analytics_website (website_id, visited_at DESC),
  INDEX idx_analytics_date (visited_at)
);

-- Image Assets Table (for AI-generated images)
CREATE TABLE website_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,

  -- Image Data
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_size INTEGER,  -- bytes
  mime_type VARCHAR(50),

  -- Storage
  storage_url TEXT NOT NULL,  -- S3/CDN URL
  storage_provider VARCHAR(20) DEFAULT 's3',  -- s3, cloudinary, local

  -- Usage
  used_in_page BOOLEAN DEFAULT TRUE,
  alt_text TEXT,

  -- AI Context (for chat reference)
  uploaded_via_chat BOOLEAN DEFAULT FALSE,
  chat_session_id UUID REFERENCES chat_sessions(id),
  ai_description TEXT,  -- What AI said about this image

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Deployment History (version control)
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,

  -- Deployment Info
  version INTEGER NOT NULL,
  deployment_status VARCHAR(20) NOT NULL,  -- success, failed, in_progress
  deployment_provider VARCHAR(20) NOT NULL,
  deployed_by UUID REFERENCES users(id),

  -- Code Snapshot
  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,

  -- Changes
  change_summary TEXT,  -- What changed in this deployment
  triggered_by VARCHAR(20) DEFAULT 'manual',  -- manual, chat, api

  -- Results
  deployment_url TEXT,
  error_message TEXT,  -- If failed
  deployment_time_ms INTEGER,  -- How long it took

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

-- Domain Verification Tokens
CREATE TABLE domain_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,

  -- Verification
  verification_token VARCHAR(255) NOT NULL,
  verification_method VARCHAR(20) DEFAULT 'dns',  -- dns, http, email
  verification_status VARCHAR(20) DEFAULT 'pending',  -- pending, verified, failed

  -- DNS Records Expected
  expected_cname TEXT,
  expected_txt TEXT,

  -- Verification Result
  verified_at TIMESTAMP,
  last_check_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

---

## 🌐 HOSTING ARCHITECTURE

### Three-Tier Hosting Strategy

#### **Tier 1: Free Subdomain (Internal Hosting)**

```
User Website: tomas.webchat.cz
Hosting: Our Cloudflare/Vercel/Netlify
Cost: Free
Features:
  - Auto SSL (Let's Encrypt)
  - CDN enabled
  - No custom domain
  - Analytics included
```

**Implementation:**
```typescript
// Deploy to Cloudflare Pages API
async function deployToSubdomain(website: Website) {
  // Generate static site
  const files = {
    'index.html': website.html_code,
    'style.css': website.css_code,
    'script.js': website.js_code,
    'analytics.js': generateAnalyticsScript(website.id)
  };

  // Deploy to Cloudflare Pages
  await cloudflare.pages.deploy({
    accountId: process.env.CF_ACCOUNT_ID,
    projectName: website.subdomain,
    files
  });

  // URL: https://tomas.webchat-sites.pages.dev
  // CNAME: tomas.webchat.cz -> tomas.webchat-sites.pages.dev
}
```

#### **Tier 2: Custom Domain (CNAME to Our Hosting)**

```
User Domain: tomas.cz
Points To: cname.webchat.cz (our server)
Hosting: Our infrastructure
Cost: $5/month or $50/year
Features:
  - Custom domain
  - Auto SSL
  - Same hosting as Tier 1
  - User owns domain
```

**Implementation:**
```typescript
async function setupCustomDomain(website: Website, domain: string) {
  // 1. Verify user owns domain (DNS TXT record)
  const verificationToken = generateToken();
  await createVerification({
    website_id: website.id,
    domain,
    verification_token: verificationToken,
    expected_txt: `webchat-verification=${verificationToken}`
  });

  // 2. User adds DNS records:
  // TXT: webchat-verification=abc123
  // CNAME: @ -> cname.webchat.cz

  // 3. Verify DNS
  const isVerified = await verifyDNS(domain, verificationToken);

  // 4. Issue SSL certificate (Let's Encrypt)
  await issueSSL(domain);

  // 5. Deploy site to custom domain
  await deployToCustomDomain(website, domain);
}
```

#### **Tier 3: Wedos Full Hosting (Advanced)**

```
User Domain: tomas.cz
Hosting: Wedos servers
Deployment: FTP automated
Cost: User pays Wedos directly
Features:
  - Full Wedos hosting control
  - We just deploy files
  - User manages Wedos account
```

**Implementation:**
```typescript
async function deployToWedos(website: Website, wedosCredentials: WedosCredentials) {
  // 1. Connect via FTP
  const ftp = new FTPClient();
  await ftp.connect({
    host: wedosCredentials.ftp_host,  // e.g., 123456.w78.wedos.net
    user: wedosCredentials.ftp_user,  // e.g., w123456
    password: decryptPassword(wedosCredentials.ftp_password_encrypted)
  });

  // 2. Upload files
  await ftp.put(website.html_code, '/www/index.html');
  await ftp.put(website.css_code, '/www/style.css');
  await ftp.put(website.js_code, '/www/script.js');

  // 3. Add analytics script
  await ftp.put(generateAnalyticsScript(website.id), '/www/analytics.js');

  // 4. Close connection
  await ftp.end();

  // 5. Update database
  await updateWebsite(website.id, {
    deployment_status: 'live',
    deployment_provider: 'wedos',
    deployed_at: new Date(),
    deployment_url: `https://${website.custom_domain}`
  });
}
```

---

## 🔒 SECURITY ARCHITECTURE

### Critical Security Measures

#### 1. **User Code Sanitization**

```typescript
// NEVER trust user-generated code
function sanitizeUserCode(html: string): string {
  // Remove dangerous tags
  html = html.replace(/<script[^>]*>.*?<\/script>/gi, '<!-- script removed -->');
  html = html.replace(/<iframe[^>]*>.*?<\/iframe>/gi, '<!-- iframe removed -->');

  // BUT - AI generates the code, so we trust AI output
  // Only sanitize if user manually edits code

  // Add security headers in all deployments
  return html;
}

// Security headers for all hosted sites
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

#### 2. **Domain Isolation**

```typescript
// Each website runs in its own subdomain/domain
// No shared cookies, storage, or resources

// Cloudflare Worker for routing
export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    const subdomain = url.hostname.split('.')[0];

    // Get website by subdomain
    const website = await db.getWebsiteBySubdomain(subdomain);

    if (!website || website.deployment_status !== 'live') {
      return new Response('Website not found', { status: 404 });
    }

    // Track analytics (async, don't block response)
    trackVisit(website.id, request);

    // Serve website with security headers
    return new Response(website.html_code, {
      headers: {
        'Content-Type': 'text/html',
        ...SECURITY_HEADERS
      }
    });
  }
}
```

#### 3. **Rate Limiting & DDoS Protection**

```typescript
// Cloudflare automatically handles DDoS
// Add application-level rate limiting

const rateLimits = {
  deployments: '5 per hour per user',
  analytics: '1000 requests per day per website',
  chatMessages: '50 per hour per user'
};

// Redis-based rate limiting
async function checkRateLimit(userId: string, action: string): Promise<boolean> {
  const key = `ratelimit:${userId}:${action}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 3600); // 1 hour
  }

  return count <= rateLimits[action];
}
```

#### 4. **Encrypted Wedos Credentials**

```typescript
// NEVER store plain-text passwords
import crypto from 'crypto';

const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

function encryptPassword(password: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString('hex'),
    encrypted,
    authTag: authTag.toString('hex')
  });
}

function decryptPassword(encryptedData: string): string {
  const { iv, encrypted, authTag } = JSON.parse(encryptedData);

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

## 📊 ANALYTICS SYSTEM

### Privacy-Focused Analytics (No Cookies)

```typescript
// Client-side analytics script (injected in all sites)
(function() {
  const websiteId = 'WEBSITE_ID_HERE';
  const apiUrl = 'https://api.webchat.cz/analytics';

  // Track page view
  fetch(`${apiUrl}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      website_id: websiteId,
      page_url: window.location.href,
      referrer: document.referrer,
      screen_width: screen.width,
      screen_height: screen.height,
      user_agent: navigator.userAgent,
      language: navigator.language,
      timestamp: new Date().toISOString()
    })
  });

  // Track session duration on page unload
  let startTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const duration = Math.floor((Date.now() - startTime) / 1000);
    navigator.sendBeacon(`${apiUrl}/duration`, JSON.stringify({
      website_id: websiteId,
      duration
    }));
  });
})();
```

### Analytics Dashboard API

```typescript
// GET /api/v1/websites/:id/analytics
export async function getWebsiteAnalytics(req: Request, res: Response) {
  const { id } = req.params;
  const { period = '30d' } = req.query;  // 7d, 30d, 90d, all

  // Verify ownership
  const website = await db.getWebsite(id);
  if (website.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Get analytics
  const stats = await db.query(`
    SELECT
      DATE(visited_at) as date,
      COUNT(*) as views,
      COUNT(DISTINCT visitor_ip) as unique_visitors,
      AVG(session_duration) as avg_duration
    FROM website_analytics
    WHERE website_id = $1
      AND visited_at >= NOW() - INTERVAL '${period}'
    GROUP BY DATE(visited_at)
    ORDER BY date DESC
  `, [id]);

  // Top pages
  const topPages = await db.query(`
    SELECT
      page_url,
      COUNT(*) as views
    FROM website_analytics
    WHERE website_id = $1
      AND visited_at >= NOW() - INTERVAL '${period}'
    GROUP BY page_url
    ORDER BY views DESC
    LIMIT 10
  `, [id]);

  // Device breakdown
  const devices = await db.query(`
    SELECT
      device_type,
      COUNT(*) as count
    FROM website_analytics
    WHERE website_id = $1
      AND visited_at >= NOW() - INTERVAL '${period}'
    GROUP BY device_type
  `, [id]);

  res.json({
    period,
    stats,
    topPages,
    devices,
    totalViews: website.total_views,
    uniqueVisitors: website.unique_visitors
  });
}
```

---

## 💬 CHAT-BASED EDITING FLOW

### Edit Website via Chat

```typescript
// User clicks "Edit" on website card
// Opens chat with context loaded

// GET /api/v1/websites/:id/edit-session
export async function createEditSession(req: Request, res: Response) {
  const { id } = req.params;

  // Get website
  const website = await db.getWebsite(id);
  if (website.user_id !== req.userId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Create new chat session OR reopen existing one
  let chatSession = await db.getChatSessionForWebsite(id);

  if (!chatSession) {
    // Create new edit session
    chatSession = await db.createChatSession({
      user_id: req.userId,
      website_id: id,
      messages: [
        {
          role: 'assistant',
          content: `Hi! I'm ready to help you edit "${website.name}". What would you like to change?`,
          timestamp: new Date().toISOString()
        }
      ]
    });
  }

  // Return session ID and website data
  res.json({
    sessionId: chatSession.id,
    website: {
      id: website.id,
      name: website.name,
      htmlCode: website.html_code,
      cssCode: website.css_code,
      jsCode: website.js_code,
      deploymentUrl: website.deployment_url
    }
  });
}

// User makes changes via chat
// "Make the header blue"
// AI regenerates code with changes
// User clicks "Save & Deploy"

// POST /api/v1/websites/:id/deploy
export async function deployChanges(req: Request, res: Response) {
  const { id } = req.params;
  const { htmlCode, cssCode, jsCode, changeSummary } = req.body;

  // Update website
  await db.updateWebsite(id, {
    html_code: htmlCode,
    css_code: cssCode,
    js_code: jsCode,
    updated_at: new Date()
  });

  // Create deployment record
  const deployment = await db.createDeployment({
    website_id: id,
    version: await getNextVersion(id),
    html_code: htmlCode,
    css_code: cssCode,
    js_code: jsCode,
    change_summary: changeSummary,
    deployed_by: req.userId,
    triggered_by: 'chat'
  });

  // Deploy based on provider
  const website = await db.getWebsite(id);

  if (website.deployment_provider === 'wedos') {
    await deployToWedos(website);
  } else {
    await deployToSubdomain(website);
  }

  // Update deployment status
  await db.updateDeployment(deployment.id, {
    deployment_status: 'success',
    deployment_time_ms: Date.now() - startTime
  });

  res.json({
    success: true,
    deploymentUrl: website.deployment_url,
    version: deployment.version
  });
}
```

---

## 🖼️ IMAGE UPLOAD IN CHAT

### Drag & Drop Images

```typescript
// Frontend: ChatInput.tsx
function ChatInput() {
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const images = files.filter(f => f.type.startsWith('image/'));

    // Upload images
    const uploadedImages = await Promise.all(
      images.map(img => uploadImage(img))
    );

    // Send to AI with context
    const message = `I've uploaded ${images.length} image(s). Please use them in the website.`;
    await sendMessage({
      message,
      attachments: uploadedImages.map(img => ({
        type: 'image',
        url: img.url,
        filename: img.filename
      }))
    });
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      className={dragActive ? 'drag-active' : ''}
    >
      <input type="file" accept="image/*" multiple onChange={handleFileSelect} />
      <textarea placeholder="Type a message or drag images here..." />
    </div>
  );
}

// Backend: Upload to S3/Cloudinary
async function uploadImage(file: File, websiteId: string): Promise<ImageAsset> {
  // Upload to S3
  const filename = `${uuid()}-${file.name}`;
  const url = await s3.upload({
    Bucket: process.env.S3_BUCKET,
    Key: `websites/${websiteId}/images/${filename}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  });

  // Save to database
  const image = await db.createImage({
    website_id: websiteId,
    filename,
    original_filename: file.name,
    file_size: file.size,
    mime_type: file.mimetype,
    storage_url: url.Location,
    storage_provider: 's3',
    uploaded_via_chat: true
  });

  return image;
}

// AI uses images in generation
const prompt = `
User uploaded these images:
${images.map(img => `- ${img.filename}: ${img.ai_description || 'No description'}`).join('\n')}

Generate website code that uses these images appropriately.
`;
```

---

## 🎨 DASHBOARD DESIGN (Vercel-Style)

### Layout Structure

```tsx
// Dashboard.tsx (Modern SaaS Style)
import { Card, Button, Badge } from '@/components/ui';

export function Dashboard() {
  const { websites, isLoading } = useWebsites();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Your Websites</h1>
        <Button onClick={() => navigate('/builder')}>
          + New Website
        </Button>
      </header>

      {/* Stats Overview */}
      <div className="stats-grid">
        <StatCard
          title="Total Websites"
          value={websites.length}
          icon={<Globe />}
        />
        <StatCard
          title="Total Views"
          value={websites.reduce((sum, w) => sum + w.total_views, 0)}
          icon={<Eye />}
        />
        <StatCard
          title="Live Sites"
          value={websites.filter(w => w.deployment_status === 'live').length}
          icon={<Check />}
        />
      </div>

      {/* Websites Grid */}
      <div className="websites-grid">
        {websites.map(website => (
          <WebsiteCard key={website.id} website={website} />
        ))}
      </div>
    </div>
  );
}

// WebsiteCard.tsx
function WebsiteCard({ website }: { website: Website }) {
  return (
    <Card className="website-card">
      {/* Preview Image */}
      <div className="preview-image">
        <img src={website.preview_image_url || '/placeholder.png'} alt={website.name} />
        <Badge className="status-badge" variant={getStatusVariant(website.deployment_status)}>
          {website.deployment_status}
        </Badge>
      </div>

      {/* Info */}
      <div className="card-content">
        <h3>{website.name}</h3>
        <p className="domain">
          {website.custom_domain || `${website.subdomain}.webchat.cz`}
        </p>

        {/* Stats */}
        <div className="stats">
          <span>{website.total_views} views</span>
          <span>{website.unique_visitors} visitors</span>
        </div>

        {/* Actions */}
        <div className="actions">
          <Button variant="ghost" onClick={() => window.open(website.deployment_url)}>
            <ExternalLink /> View
          </Button>
          <Button variant="ghost" onClick={() => editWebsite(website.id)}>
            <Edit /> Edit
          </Button>
          <Button variant="ghost" onClick={() => viewAnalytics(website.id)}>
            <BarChart /> Analytics
          </Button>
          <DropdownMenu>
            <DropdownMenuItem onClick={() => deployWebsite(website.id)}>
              Deploy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateWebsite(website.id)}>
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteWebsite(website.id)} destructive>
              Delete
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}
```

### Styles (Tailwind/Shadcn)

```css
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.websites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.website-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.website-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-4px);
}

.preview-image {
  position: relative;
  aspect-ratio: 16/9;
  background: var(--muted);
  overflow: hidden;
}

.preview-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
}
```

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Database & Backend (Week 1)
- [ ] Update database schema
- [ ] Create deployment service
- [ ] Build analytics tracking
- [ ] Implement image upload
- [ ] Add versioning system

### Phase 2: Dashboard (Week 1-2)
- [ ] Redesign Dashboard page
- [ ] Create WebsiteCard component
- [ ] Build analytics dashboard
- [ ] Add deployment UI

### Phase 3: Hosting (Week 2-3)
- [ ] Set up Cloudflare Workers/Pages
- [ ] Implement subdomain hosting
- [ ] Add custom domain support
- [ ] SSL automation
- [ ] Wedos FTP integration

### Phase 4: Chat Editing (Week 3)
- [ ] Edit session creation
- [ ] Image upload in chat
- [ ] Deploy from chat
- [ ] Version comparison

### Phase 5: Security & Testing (Week 4)
- [ ] Security audit
- [ ] Rate limiting
- [ ] DDoS protection
- [ ] Load testing
- [ ] User testing

---

## 📞 QUESTIONS FOR YOU

1. **Hosting Provider Preference:**
   - Cloudflare Pages (recommended - free, fast, global CDN)
   - Vercel (easy, expensive)
   - Netlify (good features, moderate cost)
   - Self-hosted (full control, more work)

2. **Wedos API Access:**
   - Do you have Wedos account?
   - Can you get WAPI credentials?
   - Should Wedos be Tier 3 (optional) or mandatory?

3. **Pricing:**
   - Free tier: Subdomain only?
   - Paid tier: $5/month for custom domain?
   - Agency tier: $50/month for unlimited clients?

4. **Analytics:**
   - Simple built-in only?
   - Or also support Google Analytics?

---

This is **enterprise-grade architecture**. Let me know your answers and I'll start building! 🚀
