-- ============================================
-- WebChat.ai Database Schema
-- Version: 1.0.0
-- Description: Initial database setup with all tables, indexes, RLS policies, and triggers
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For encryption

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),

  -- Subscription
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'pro'
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_started_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  stripe_customer_id VARCHAR(255) UNIQUE,

  -- API Keys (encrypted)
  wedos_ftp_host VARCHAR(255),
  wedos_ftp_username VARCHAR(255),
  wedos_ftp_password_encrypted TEXT,

  -- Verification
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================
-- TABLE: websites
-- ============================================
CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  subdomain VARCHAR(100) UNIQUE,
  custom_domain VARCHAR(255),

  -- Code
  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,

  -- Multi-page support
  pages JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  content_data JSONB DEFAULT '{}',

  -- Generation metadata
  ai_conversation JSONB DEFAULT '[]',
  theme VARCHAR(50),
  color_scheme JSONB,

  -- Publishing
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  preview_image_url TEXT,

  -- Payment
  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP,
  payment_amount DECIMAL(10, 2),

  -- Stats
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_websites_user ON websites(user_id);
CREATE INDEX idx_websites_subdomain ON websites(subdomain);
CREATE INDEX idx_websites_custom_domain ON websites(custom_domain);
CREATE INDEX idx_websites_published ON websites(is_published);

-- ============================================
-- TABLE: website_versions
-- ============================================
CREATE TABLE website_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,

  version_number INTEGER NOT NULL,
  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,
  pages JSONB DEFAULT '[]',
  content_data JSONB DEFAULT '{}',

  change_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_versions_website ON website_versions(website_id, version_number DESC);

-- ============================================
-- TABLE: chat_sessions
-- ============================================
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  messages JSONB NOT NULL DEFAULT '[]',
  model_used VARCHAR(50),
  tokens_used INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_website ON chat_sessions(website_id);
CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE SET NULL,

  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),

  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  payment_type VARCHAR(50),

  status VARCHAR(50) DEFAULT 'pending',

  invoice_url TEXT,
  invoice_pdf TEXT,

  description TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON payments(status);

-- ============================================
-- TABLE: templates
-- ============================================
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),

  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,
  pages JSONB DEFAULT '[]',

  thumbnail_url TEXT,
  demo_url TEXT,

  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,

  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_active ON templates(is_active);

-- ============================================
-- TABLE: hosting_accounts
-- ============================================
CREATE TABLE hosting_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  provider VARCHAR(50) NOT NULL,

  ftp_host VARCHAR(255) NOT NULL,
  ftp_username VARCHAR(255) NOT NULL,
  ftp_password_encrypted TEXT NOT NULL,
  ftp_port INTEGER DEFAULT 21,

  is_verified BOOLEAN DEFAULT FALSE,
  last_tested_at TIMESTAMP,
  test_status VARCHAR(50),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hosting_accounts_user ON hosting_accounts(user_id);

-- ============================================
-- TABLE: usage_logs
-- ============================================
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  action VARCHAR(100) NOT NULL,

  api_endpoint VARCHAR(255),
  request_method VARCHAR(10),
  response_status INTEGER,

  ai_model VARCHAR(50),
  tokens_used INTEGER,
  cost_estimate DECIMAL(10, 6),

  ip_address INET,
  user_agent TEXT,

  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_usage_logs_user_timestamp ON usage_logs(user_id, timestamp DESC);
CREATE INDEX idx_usage_logs_action ON usage_logs(action);
CREATE INDEX idx_usage_logs_timestamp ON usage_logs(timestamp DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Users: Can only see own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = auth.uid());

-- Websites: Can see own + public
CREATE POLICY "Users can view own or public websites"
  ON websites FOR SELECT
  USING (user_id = auth.uid() OR is_published = TRUE);

CREATE POLICY "Users can create own websites"
  ON websites FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own websites"
  ON websites FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own websites"
  ON websites FOR DELETE
  USING (user_id = auth.uid());

-- Website versions: Only owner
CREATE POLICY "Users can view own website versions"
  ON website_versions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM websites
    WHERE websites.id = website_versions.website_id
    AND websites.user_id = auth.uid()
  ));

-- Chat sessions: Only owner
CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions FOR ALL
  USING (user_id = auth.uid());

-- Payments: Only owner
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (user_id = auth.uid());

-- Hosting accounts: Only owner
CREATE POLICY "Users can manage own hosting accounts"
  ON hosting_accounts FOR ALL
  USING (user_id = auth.uid());

-- Templates: Everyone can view active
CREATE POLICY "Everyone can view active templates"
  ON templates FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_websites_updated_at BEFORE UPDATE ON websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Clean up old usage logs (run daily via cron)
CREATE OR REPLACE FUNCTION cleanup_old_usage_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM usage_logs
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Increment website view count
CREATE OR REPLACE FUNCTION increment_website_views(website_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE websites
  SET view_count = view_count + 1,
      last_viewed_at = NOW()
  WHERE id = website_uuid;
END;
$$ LANGUAGE plpgsql;
