-- ═══════════════════════════════════════════════════════════
-- PRODUCTION ARCHITECTURE - Multi-Website Dashboard
-- ═══════════════════════════════════════════════════════════
-- Adds deployment, analytics, hosting, and versioning features
-- ═══════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════
-- STEP 1: Enhance websites table
-- ═══════════════════════════════════════════════════════════

-- Add deployment columns
ALTER TABLE websites
ADD COLUMN IF NOT EXISTS subdomain VARCHAR(100),
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255),
ADD COLUMN IF NOT EXISTS custom_domain_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ssl_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deployment_status VARCHAR(20) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS deployment_provider VARCHAR(20) DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_deployed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS deployment_url TEXT,
ADD COLUMN IF NOT EXISTS wedos_service_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS wedos_domain_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS wedos_ftp_path TEXT,
ADD COLUMN IF NOT EXISTS total_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS unique_visitors INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'none';

-- Add constraints
ALTER TABLE websites
ADD CONSTRAINT check_deployment_status
  CHECK (deployment_status IN ('draft', 'deploying', 'live', 'failed', 'archived')),
ADD CONSTRAINT check_deployment_provider
  CHECK (deployment_provider IN ('internal', 'wedos', 'custom')),
ADD CONSTRAINT check_subscription_status
  CHECK (subscription_status IN ('none', 'active', 'expired'));

-- Add unique constraint for subdomains
CREATE UNIQUE INDEX IF NOT EXISTS idx_websites_subdomain_unique
  ON websites(subdomain)
  WHERE subdomain IS NOT NULL;

-- ═══════════════════════════════════════════════════════════
-- STEP 2: Create website_analytics table
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS website_analytics (
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
  session_duration INTEGER DEFAULT 0,  -- seconds

  -- Constraints
  CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown'))
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_website_date
  ON website_analytics(website_id, visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_visited_at
  ON website_analytics(visited_at);

CREATE INDEX IF NOT EXISTS idx_analytics_device
  ON website_analytics(device_type);

-- Enable RLS
ALTER TABLE website_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "website_analytics_select_own"
  ON website_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM websites w
      WHERE w.id = website_analytics.website_id
      AND w.user_id = (SELECT auth.uid())
    )
  );

-- Service role can insert (for analytics tracking)
CREATE POLICY "website_analytics_insert_service"
  ON website_analytics FOR INSERT
  TO service_role
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════
-- STEP 3: Create website_images table
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS website_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,

  -- Image Data
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_size INTEGER,  -- bytes
  mime_type VARCHAR(50),

  -- Storage
  storage_url TEXT NOT NULL,
  storage_provider VARCHAR(20) DEFAULT 's3',

  -- Usage
  used_in_page BOOLEAN DEFAULT TRUE,
  alt_text TEXT,

  -- AI Context
  uploaded_via_chat BOOLEAN DEFAULT FALSE,
  chat_session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  ai_description TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CHECK (storage_provider IN ('s3', 'cloudinary', 'local', 'cdn'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_images_website
  ON website_images(website_id);

CREATE INDEX IF NOT EXISTS idx_images_chat_session
  ON website_images(chat_session_id)
  WHERE chat_session_id IS NOT NULL;

-- Enable RLS
ALTER TABLE website_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "website_images_select_own"
  ON website_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM websites w
      WHERE w.id = website_images.website_id
      AND w.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "website_images_insert_own"
  ON website_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites w
      WHERE w.id = website_images.website_id
      AND w.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "website_images_delete_own"
  ON website_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM websites w
      WHERE w.id = website_images.website_id
      AND w.user_id = (SELECT auth.uid())
    )
  );

-- ═══════════════════════════════════════════════════════════
-- STEP 4: Create deployments table (Version History)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,

  -- Deployment Info
  version INTEGER NOT NULL,
  deployment_status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
  deployment_provider VARCHAR(20) NOT NULL,
  deployed_by UUID NOT NULL REFERENCES users(id),

  -- Code Snapshot
  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,

  -- Changes
  change_summary TEXT,
  triggered_by VARCHAR(20) DEFAULT 'manual',

  -- Results
  deployment_url TEXT,
  error_message TEXT,
  deployment_time_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  -- Constraints
  CHECK (deployment_status IN ('in_progress', 'success', 'failed')),
  CHECK (deployment_provider IN ('internal', 'wedos', 'custom')),
  CHECK (triggered_by IN ('manual', 'chat', 'api', 'scheduled'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deployments_website
  ON deployments(website_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_deployments_status
  ON deployments(deployment_status);

-- Enable RLS
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "deployments_select_own"
  ON deployments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM websites w
      WHERE w.id = deployments.website_id
      AND w.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "deployments_insert_own"
  ON deployments FOR INSERT
  WITH CHECK (deployed_by = (SELECT auth.uid()));

-- ═══════════════════════════════════════════════════════════
-- STEP 5: Create domain_verifications table
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS domain_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,

  -- Verification
  verification_token VARCHAR(255) NOT NULL,
  verification_method VARCHAR(20) DEFAULT 'dns',
  verification_status VARCHAR(20) DEFAULT 'pending',

  -- DNS Records Expected
  expected_cname TEXT,
  expected_txt TEXT,

  -- Verification Result
  verified_at TIMESTAMP,
  last_check_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,

  -- Constraints
  CHECK (verification_method IN ('dns', 'http', 'email')),
  CHECK (verification_status IN ('pending', 'verified', 'failed', 'expired'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_domain_verifications_website
  ON domain_verifications(website_id);

CREATE INDEX IF NOT EXISTS idx_domain_verifications_domain
  ON domain_verifications(domain);

CREATE INDEX IF NOT EXISTS idx_domain_verifications_status
  ON domain_verifications(verification_status);

-- Enable RLS
ALTER TABLE domain_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "domain_verifications_all_own"
  ON domain_verifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM websites w
      WHERE w.id = domain_verifications.website_id
      AND w.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM websites w
      WHERE w.id = domain_verifications.website_id
      AND w.user_id = (SELECT auth.uid())
    )
  );

-- ═══════════════════════════════════════════════════════════
-- STEP 6: Add helper functions
-- ═══════════════════════════════════════════════════════════

-- Function to get next deployment version
CREATE OR REPLACE FUNCTION get_next_deployment_version(website_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  max_version INTEGER;
BEGIN
  SELECT COALESCE(MAX(version), 0) INTO max_version
  FROM deployments
  WHERE website_id = website_uuid;

  RETURN max_version + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update website analytics counters
CREATE OR REPLACE FUNCTION update_website_view_counts()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE websites
  SET
    total_views = total_views + 1,
    last_viewed_at = NEW.visited_at
  WHERE id = NEW.website_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_website_views ON website_analytics;
CREATE TRIGGER trigger_update_website_views
  AFTER INSERT ON website_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_website_view_counts();

-- Function to calculate unique visitors (daily job)
CREATE OR REPLACE FUNCTION calculate_unique_visitors()
RETURNS void AS $$
BEGIN
  UPDATE websites w
  SET unique_visitors = (
    SELECT COUNT(DISTINCT visitor_ip)
    FROM website_analytics
    WHERE website_id = w.id
  );
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old analytics (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM website_analytics
  WHERE visited_at < NOW() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════════
-- STEP 7: Create views for dashboard
-- ═══════════════════════════════════════════════════════════

-- View for website stats
CREATE OR REPLACE VIEW website_stats AS
SELECT
  w.id,
  w.user_id,
  w.name,
  w.subdomain,
  w.custom_domain,
  w.deployment_status,
  w.deployment_url,
  w.total_views,
  w.unique_visitors,
  w.created_at,
  w.updated_at,
  COUNT(DISTINCT d.id) as deployment_count,
  MAX(d.created_at) as last_deployment_at,
  COUNT(DISTINCT i.id) as image_count
FROM websites w
LEFT JOIN deployments d ON d.website_id = w.id AND d.deployment_status = 'success'
LEFT JOIN website_images i ON i.website_id = w.id
GROUP BY w.id;

-- ═══════════════════════════════════════════════════════════
-- STEP 8: Verification
-- ═══════════════════════════════════════════════════════════

DO $$
DECLARE
  table_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count new tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('website_analytics', 'website_images', 'deployments', 'domain_verifications');

  -- Count new policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('website_analytics', 'website_images', 'deployments', 'domain_verifications');

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ PRODUCTION ARCHITECTURE MIGRATION COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'New tables created: %', table_count;
  RAISE NOTICE 'RLS policies added: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 New Features Enabled:';
  RAISE NOTICE '  • Multi-website dashboard ✅';
  RAISE NOTICE '  • Deployment versioning ✅';
  RAISE NOTICE '  • Analytics tracking ✅';
  RAISE NOTICE '  • Image management ✅';
  RAISE NOTICE '  • Domain verification ✅';
  RAISE NOTICE '  • Subdomain hosting ✅';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tables:';
  RAISE NOTICE '  • websites (enhanced)';
  RAISE NOTICE '  • website_analytics';
  RAISE NOTICE '  • website_images';
  RAISE NOTICE '  • deployments';
  RAISE NOTICE '  • domain_verifications';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for production deployment!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
