-- ============================================
-- WebChat.ai - Account Tiers & B2B2C System
-- Migration 008: Account types, Developer features, Client management
-- ============================================

-- ============================================
-- UPDATE: users table - Add account tiers
-- ============================================

-- Add new account tier types
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_subscription_tier_check;

ALTER TABLE users
  ALTER COLUMN subscription_tier TYPE VARCHAR(20);

-- Add account type (personal, freelancer, agency)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'personal' CHECK (account_type IN ('personal', 'freelancer', 'agency'));

-- Add developer-specific fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS agency_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS agency_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS agency_website VARCHAR(255),
  ADD COLUMN IF NOT EXISTS portfolio_generated BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS white_label_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS custom_branding JSONB DEFAULT '{}';

-- Add billing fields
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS billing_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS billing_address JSONB,
  ADD COLUMN IF NOT EXISTS tax_id VARCHAR(100);

-- Update subscription tier constraint
ALTER TABLE users
  ADD CONSTRAINT users_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'personal', 'freelancer', 'agency'));

-- ============================================
-- TABLE: clients (B2B2C relationship)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Client info
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_company VARCHAR(255),
  client_phone VARCHAR(50),
  client_logo_url TEXT,

  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  invitation_token VARCHAR(255) UNIQUE,
  invitation_sent_at TIMESTAMP,
  invitation_accepted_at TIMESTAMP,

  -- Access control
  client_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  access_level VARCHAR(20) DEFAULT 'view' CHECK (access_level IN ('view', 'edit', 'admin')),

  -- Billing
  monthly_fee DECIMAL(10, 2),
  billing_cycle VARCHAR(20) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly', 'one-time')),
  next_billing_date DATE,
  total_revenue DECIMAL(10, 2) DEFAULT 0,

  -- Metadata
  notes TEXT,
  tags JSONB DEFAULT '[]',
  custom_fields JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clients_developer ON clients(developer_id);
CREATE INDEX idx_clients_email ON clients(client_email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_invitation_token ON clients(invitation_token);

-- ============================================
-- TABLE: portfolio_websites
-- AI-generated demo sites for developer portfolios
-- ============================================
CREATE TABLE IF NOT EXISTS portfolio_websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Website info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- 'e-commerce', 'restaurant', 'portfolio', etc.

  -- Code
  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,

  -- Preview
  thumbnail_url TEXT,
  preview_url TEXT,

  -- Display settings
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,

  -- Fake project details (for realism)
  fake_client_name VARCHAR(255),
  fake_completion_date DATE,
  fake_technologies JSONB DEFAULT '[]',
  fake_testimonial TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_developer ON portfolio_websites(developer_id);
CREATE INDEX idx_portfolio_category ON portfolio_websites(category);
CREATE INDEX idx_portfolio_featured ON portfolio_websites(is_featured);

-- ============================================
-- TABLE: client_websites
-- Websites built for clients (link to actual websites table)
-- ============================================
CREATE TABLE IF NOT EXISTS client_websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE NOT NULL,
  developer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Project details
  project_name VARCHAR(255),
  project_status VARCHAR(20) DEFAULT 'in_progress' CHECK (project_status IN ('in_progress', 'review', 'completed', 'maintenance')),

  -- Pricing
  quoted_price DECIMAL(10, 2),
  final_price DECIMAL(10, 2),
  payment_status VARCHAR(20) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),

  -- Timeline
  started_at TIMESTAMP DEFAULT NOW(),
  estimated_completion DATE,
  completed_at TIMESTAMP,

  -- Communication
  last_client_message_at TIMESTAMP,
  unread_messages_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(client_id, website_id)
);

CREATE INDEX idx_client_websites_client ON client_websites(client_id);
CREATE INDEX idx_client_websites_developer ON client_websites(developer_id);
CREATE INDEX idx_client_websites_status ON client_websites(project_status);

-- ============================================
-- TABLE: developer_analytics
-- Track revenue, clients, projects for developers
-- ============================================
CREATE TABLE IF NOT EXISTS developer_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  developer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,

  -- Date tracking
  date DATE NOT NULL,

  -- Metrics
  total_clients INTEGER DEFAULT 0,
  active_clients INTEGER DEFAULT 0,
  new_clients INTEGER DEFAULT 0,
  churned_clients INTEGER DEFAULT 0,

  total_websites INTEGER DEFAULT 0,
  active_websites INTEGER DEFAULT 0,
  new_websites INTEGER DEFAULT 0,

  -- Revenue
  revenue_today DECIMAL(10, 2) DEFAULT 0,
  revenue_mtd DECIMAL(10, 2) DEFAULT 0,
  revenue_ytd DECIMAL(10, 2) DEFAULT 0,

  -- Platform usage
  api_calls INTEGER DEFAULT 0,
  ai_generations INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(developer_id, date)
);

CREATE INDEX idx_dev_analytics_developer ON developer_analytics(developer_id, date DESC);

-- ============================================
-- TABLE: subscription_plans
-- Define available plans and features
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Plan details
  name VARCHAR(50) NOT NULL UNIQUE,
  tier VARCHAR(20) NOT NULL UNIQUE, -- 'free', 'personal', 'freelancer', 'agency'
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2) NOT NULL,

  -- Limits
  max_websites INTEGER,
  max_clients INTEGER,
  max_custom_domains INTEGER,
  max_ai_generations_monthly INTEGER,
  max_storage_gb INTEGER,

  -- Features (JSONB for flexibility)
  features JSONB DEFAULT '{}',
  /*
  Example features:
  {
    "custom_domain": true,
    "white_label": true,
    "priority_support": true,
    "advanced_analytics": true,
    "client_management": true,
    "portfolio_generator": true,
    "api_access": true,
    "team_members": 5
  }
  */

  -- Display
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,

  -- Stripe integration
  stripe_price_id_monthly VARCHAR(255),
  stripe_price_id_yearly VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, tier, price_monthly, price_yearly, max_websites, max_clients, max_custom_domains, max_ai_generations_monthly, max_storage_gb, features, is_popular, display_order, stripe_price_id_monthly, stripe_price_id_yearly) VALUES
('Free', 'free', 0, 0, 1, 0, 0, 3, 1,
  '{"custom_domain": false, "white_label": false, "priority_support": false, "advanced_analytics": false, "client_management": false, "portfolio_generator": false, "api_access": false, "team_members": 0}'::jsonb,
  false, 1, NULL, NULL),

('Personal', 'personal', 29, 290, 10, 0, 3, 50, 10,
  '{"custom_domain": true, "white_label": false, "priority_support": false, "advanced_analytics": true, "client_management": false, "portfolio_generator": false, "api_access": false, "team_members": 0}'::jsonb,
  false, 2, 'price_personal_monthly', 'price_personal_yearly'),

('Freelancer', 'freelancer', 99, 990, 50, 20, 10, 200, 50,
  '{"custom_domain": true, "white_label": true, "priority_support": true, "advanced_analytics": true, "client_management": true, "portfolio_generator": true, "api_access": true, "team_members": 1}'::jsonb,
  true, 3, 'price_freelancer_monthly', 'price_freelancer_yearly'),

('Agency', 'agency', 299, 2990, -1, -1, -1, 1000, 200,
  '{"custom_domain": true, "white_label": true, "priority_support": true, "advanced_analytics": true, "client_management": true, "portfolio_generator": true, "api_access": true, "team_members": 10}'::jsonb,
  false, 4, 'price_agency_monthly', 'price_agency_yearly')

ON CONFLICT (tier) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Clients: Developers can only see their clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can manage own clients"
  ON clients FOR ALL
  USING (developer_id = auth.uid());

-- Portfolio websites: Developers can see own + public view for others
ALTER TABLE portfolio_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can manage own portfolio"
  ON portfolio_websites FOR ALL
  USING (developer_id = auth.uid());

CREATE POLICY "Anyone can view visible portfolio websites"
  ON portfolio_websites FOR SELECT
  USING (is_visible = TRUE);

-- Client websites: Access for developer or client
ALTER TABLE client_websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can manage client websites"
  ON client_websites FOR ALL
  USING (developer_id = auth.uid());

CREATE POLICY "Clients can view their websites"
  ON client_websites FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = client_websites.client_id
    AND clients.client_user_id = auth.uid()
  ));

-- Developer analytics: Own only
ALTER TABLE developer_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can view own analytics"
  ON developer_analytics FOR SELECT
  USING (developer_id = auth.uid());

-- Subscription plans: Public read
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans"
  ON subscription_plans FOR SELECT
  USING (is_active = TRUE);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_websites_updated_at BEFORE UPDATE ON portfolio_websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_websites_updated_at BEFORE UPDATE ON client_websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get developer stats
CREATE OR REPLACE FUNCTION get_developer_stats(dev_id UUID)
RETURNS TABLE (
  total_clients BIGINT,
  active_clients BIGINT,
  total_websites BIGINT,
  total_revenue NUMERIC,
  websites_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM clients WHERE developer_id = dev_id AND status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM clients WHERE developer_id = dev_id AND status = 'active')::BIGINT,
    (SELECT COUNT(*) FROM client_websites WHERE developer_id = dev_id)::BIGINT,
    (SELECT COALESCE(SUM(total_revenue), 0) FROM clients WHERE developer_id = dev_id)::NUMERIC,
    (SELECT COUNT(*) FROM client_websites WHERE developer_id = dev_id AND created_at >= DATE_TRUNC('month', NOW()))::BIGINT;
END;
$$ LANGUAGE plpgsql;

-- Check if user can create more websites (based on plan limits)
CREATE OR REPLACE FUNCTION can_create_website(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier VARCHAR(20);
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  -- Get user's tier
  SELECT subscription_tier INTO user_tier FROM users WHERE id = user_id;

  -- Get max websites for tier
  SELECT max_websites INTO max_allowed
  FROM subscription_plans
  WHERE tier = user_tier;

  -- -1 means unlimited
  IF max_allowed = -1 THEN
    RETURN TRUE;
  END IF;

  -- Count current websites
  SELECT COUNT(*) INTO current_count
  FROM websites
  WHERE user_id = user_id;

  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql;

-- Check if developer can add more clients
CREATE OR REPLACE FUNCTION can_add_client(dev_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_tier VARCHAR(20);
  current_count INTEGER;
  max_allowed INTEGER;
BEGIN
  SELECT subscription_tier INTO user_tier FROM users WHERE id = dev_id;
  SELECT max_clients INTO max_allowed FROM subscription_plans WHERE tier = user_tier;

  IF max_allowed = -1 THEN
    RETURN TRUE;
  END IF;

  SELECT COUNT(*) INTO current_count FROM clients WHERE developer_id = dev_id;

  RETURN current_count < max_allowed;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE clients IS 'B2B2C client relationships - developers manage clients who use the platform';
COMMENT ON TABLE portfolio_websites IS 'AI-generated demo websites for developer portfolios';
COMMENT ON TABLE client_websites IS 'Links clients to their actual websites';
COMMENT ON TABLE developer_analytics IS 'Daily analytics rollup for developer accounts';
COMMENT ON TABLE subscription_plans IS 'Available subscription tiers and feature limits';

COMMENT ON FUNCTION can_create_website IS 'Check if user has reached website limit for their plan';
COMMENT ON FUNCTION can_add_client IS 'Check if developer can add more clients based on plan';
COMMENT ON FUNCTION get_developer_stats IS 'Get aggregate stats for a developer account';
