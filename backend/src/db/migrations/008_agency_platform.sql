-- ============================================
-- AGENCY PLATFORM MIGRATION
-- Version: 008
-- Description: Adds B2B Agency features without breaking B2C
-- Philosophy: WRAPPER, not replacement
-- ============================================

-- ============================================
-- STEP 1: EXTEND USERS TABLE (minimal changes)
-- ============================================

-- Add agency fields to existing users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'personal' CHECK (account_type IN ('personal', 'agency')),
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;

-- Index for fast agency lookups
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);

-- ============================================
-- STEP 2: AGENCIES TABLE (the "wrapper" starts here)
-- ============================================

CREATE TABLE IF NOT EXISTS agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- The user who owns this agency (1-to-1 relationship)
  owner_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Agency info from signup form
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE, -- URL-friendly name

  -- White-label branding for client portals
  branding_config JSONB DEFAULT '{
    "logo_url": null,
    "primary_color": "#6366f1",
    "secondary_color": "#8b5cf6",
    "company_name": null
  }'::jsonb,

  -- Stripe Connect for B2B2C payments
  stripe_connect_id VARCHAR(255),
  stripe_connect_status VARCHAR(50) DEFAULT 'pending',

  -- Settings
  settings JSONB DEFAULT '{
    "allow_client_login": false,
    "max_projects_per_client": 10,
    "default_subdomain_suffix": ""
  }'::jsonb,

  -- Stats (cached for performance)
  total_clients INTEGER DEFAULT 0,
  total_projects INTEGER DEFAULT 0,
  monthly_revenue DECIMAL(10, 2) DEFAULT 0.00
);

CREATE INDEX idx_agencies_owner ON agencies(owner_user_id);
CREATE INDEX idx_agencies_slug ON agencies(slug);

-- ============================================
-- STEP 3: CLIENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Parent agency
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,

  -- Client info
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),

  -- Optional: Client can have login access
  client_user_id UUID REFERENCES users(id) ON DELETE SET NULL,

  -- Business info
  company_name VARCHAR(255),
  industry VARCHAR(100),
  website_url TEXT,

  -- Notes for agency
  notes TEXT,

  -- Status
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

  -- Stats (cached)
  total_projects INTEGER DEFAULT 0,
  total_spent DECIMAL(10, 2) DEFAULT 0.00
);

CREATE INDEX idx_clients_agency ON clients(agency_id);
CREATE INDEX idx_clients_status ON clients(agency_id, status);
CREATE INDEX idx_clients_email ON clients(contact_email);

-- ============================================
-- STEP 4: AGENCY_PROJECTS TABLE (THE WRAPPER)
-- This links agency/client to existing websites table
-- ============================================

CREATE TABLE IF NOT EXISTS agency_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Parent relationships
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,

  -- THE KEY: Links to existing B2C websites table
  -- This is how we "wrap" the existing system
  website_id UUID REFERENCES websites(id) ON DELETE SET NULL,

  -- Project metadata
  project_name VARCHAR(255) NOT NULL,
  project_description TEXT,

  -- Status tracking
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'live', 'archived', 'paused')),

  -- Billing
  is_billed BOOLEAN DEFAULT FALSE,
  billed_amount DECIMAL(10, 2),
  billed_at TIMESTAMP,

  -- Client access control
  client_can_edit BOOLEAN DEFAULT FALSE,
  client_last_viewed_at TIMESTAMP,

  -- Original prompt (for context)
  initial_prompt TEXT,

  -- Custom fields for agency
  custom_fields JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_agency_projects_agency ON agency_projects(agency_id);
CREATE INDEX idx_agency_projects_client ON agency_projects(client_id);
CREATE INDEX idx_agency_projects_website ON agency_projects(website_id);
CREATE INDEX idx_agency_projects_status ON agency_projects(agency_id, status);

-- Composite index for client portal queries
CREATE INDEX idx_agency_projects_client_status ON agency_projects(client_id, status);

-- ============================================
-- STEP 5: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_projects ENABLE ROW LEVEL SECURITY;

-- Helper function: Get current user's agency_id
CREATE OR REPLACE FUNCTION get_my_agency_id()
RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT agency_id FROM users WHERE id = auth.uid()
$$;

-- Helper function: Check if user is agency admin
CREATE OR REPLACE FUNCTION is_agency_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT account_type = 'agency' FROM users WHERE id = auth.uid()
$$;

-- Helper function: Check if user owns this agency
CREATE OR REPLACE FUNCTION owns_agency(agency_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS(
    SELECT 1 FROM agencies
    WHERE id = agency_uuid
    AND owner_user_id = auth.uid()
  )
$$;

-- RLS Policies for agencies
CREATE POLICY "Agency admins can view their own agency"
  ON agencies FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Agency admins can update their own agency"
  ON agencies FOR UPDATE
  USING (owner_user_id = auth.uid());

-- RLS Policies for clients
CREATE POLICY "Agency admins can manage their clients"
  ON clients FOR ALL
  USING (EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = clients.agency_id
    AND agencies.owner_user_id = auth.uid()
  ));

CREATE POLICY "Client users can view their own profile"
  ON clients FOR SELECT
  USING (client_user_id = auth.uid());

-- RLS Policies for agency_projects
CREATE POLICY "Agency admins can manage their projects"
  ON agency_projects FOR ALL
  USING (EXISTS (
    SELECT 1 FROM agencies
    WHERE agencies.id = agency_projects.agency_id
    AND agencies.owner_user_id = auth.uid()
  ));

CREATE POLICY "Clients can view their projects"
  ON agency_projects FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients
    WHERE clients.id = agency_projects.client_id
    AND clients.client_user_id = auth.uid()
  ));

-- ============================================
-- STEP 6: MODIFY EXISTING WEBSITES RLS (CRITICAL)
-- We need to allow agency admins to see websites they created for clients
-- ============================================

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view own or published websites" ON websites;
DROP POLICY IF EXISTS "Users can view own or public websites" ON websites;

-- Create new policy that includes agency access
CREATE POLICY "Users can view own, public, or agency-managed websites"
  ON websites FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_published = TRUE
    OR EXISTS (
      -- Allow if this website is part of an agency project I own
      SELECT 1 FROM agency_projects ap
      JOIN agencies a ON a.id = ap.agency_id
      WHERE ap.website_id = websites.id
      AND a.owner_user_id = auth.uid()
    )
  );

-- Allow agency admins to update websites they manage
DROP POLICY IF EXISTS "Users can update own websites" ON websites;

CREATE POLICY "Users can update own or agency-managed websites"
  ON websites FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM agency_projects ap
      JOIN agencies a ON a.id = ap.agency_id
      WHERE ap.website_id = websites.id
      AND a.owner_user_id = auth.uid()
    )
  );

-- ============================================
-- STEP 7: TRIGGERS FOR AUTO-UPDATES
-- ============================================

-- Update updated_at timestamp
CREATE TRIGGER update_agencies_updated_at
  BEFORE UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_projects_updated_at
  BEFORE UPDATE ON agency_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate slug from agency name
CREATE OR REPLACE FUNCTION generate_agency_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));

    -- Ensure uniqueness by adding a number if needed
    WHILE EXISTS(SELECT 1 FROM agencies WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agencies_generate_slug
  BEFORE INSERT OR UPDATE ON agencies
  FOR EACH ROW EXECUTE FUNCTION generate_agency_slug();

-- Auto-update agency.total_clients count
CREATE OR REPLACE FUNCTION update_agency_client_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update count for affected agency
  IF TG_OP = 'DELETE' THEN
    UPDATE agencies
    SET total_clients = (
      SELECT COUNT(*) FROM clients WHERE agency_id = OLD.agency_id AND status = 'active'
    )
    WHERE id = OLD.agency_id;
    RETURN OLD;
  ELSE
    UPDATE agencies
    SET total_clients = (
      SELECT COUNT(*) FROM clients WHERE agency_id = NEW.agency_id AND status = 'active'
    )
    WHERE id = NEW.agency_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_update_agency_count
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_agency_client_count();

-- Auto-update agency.total_projects count
CREATE OR REPLACE FUNCTION update_agency_project_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE agencies
    SET total_projects = (
      SELECT COUNT(*) FROM agency_projects WHERE agency_id = OLD.agency_id
    )
    WHERE id = OLD.agency_id;

    UPDATE clients
    SET total_projects = (
      SELECT COUNT(*) FROM agency_projects WHERE client_id = OLD.client_id
    )
    WHERE id = OLD.client_id;

    RETURN OLD;
  ELSE
    UPDATE agencies
    SET total_projects = (
      SELECT COUNT(*) FROM agency_projects WHERE agency_id = NEW.agency_id
    )
    WHERE id = NEW.agency_id;

    UPDATE clients
    SET total_projects = (
      SELECT COUNT(*) FROM agency_projects WHERE client_id = NEW.client_id
    )
    WHERE id = NEW.client_id;

    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER agency_projects_update_counts
  AFTER INSERT OR DELETE ON agency_projects
  FOR EACH ROW EXECUTE FUNCTION update_agency_project_count();

-- ============================================
-- STEP 8: AUTO-CREATE AGENCY ON SIGNUP (TRIGGER)
-- This runs when a new user is created with account_type='agency'
-- ============================================

CREATE OR REPLACE FUNCTION handle_agency_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  new_agency_id UUID;
  agency_name_value TEXT;
BEGIN
  -- Only run for agency users
  IF NEW.account_type = 'agency' THEN

    -- Use their name or email as agency name
    agency_name_value := COALESCE(
      NULLIF(CONCAT(NEW.first_name, ' ', NEW.last_name), ' '),
      SPLIT_PART(NEW.email, '@', 1)
    ) || '''s Agency';

    -- Create their agency
    INSERT INTO agencies (owner_user_id, name)
    VALUES (NEW.id, agency_name_value)
    RETURNING id INTO new_agency_id;

    -- Link agency back to user
    NEW.agency_id := new_agency_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_user_signup_create_agency
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_agency_user_signup();

-- ============================================
-- STEP 9: HELPER FUNCTIONS FOR QUERIES
-- ============================================

-- Get all projects for a client (used in client portal)
CREATE OR REPLACE FUNCTION get_client_projects(client_uuid UUID)
RETURNS TABLE (
  project_id UUID,
  project_name VARCHAR,
  status VARCHAR,
  website_id UUID,
  website_subdomain VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ap.id,
    ap.project_name,
    ap.status,
    ap.website_id,
    w.subdomain,
    ap.created_at,
    ap.updated_at
  FROM agency_projects ap
  LEFT JOIN websites w ON w.id = ap.website_id
  WHERE ap.client_id = client_uuid
  ORDER BY ap.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get agency dashboard stats
CREATE OR REPLACE FUNCTION get_agency_stats(agency_uuid UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_clients', COUNT(DISTINCT c.id),
    'total_projects', COUNT(DISTINCT ap.id),
    'active_projects', COUNT(DISTINCT ap.id) FILTER (WHERE ap.status = 'live'),
    'total_websites', COUNT(DISTINCT w.id),
    'projects_this_month', COUNT(DISTINCT ap.id) FILTER (WHERE ap.created_at >= DATE_TRUNC('month', NOW()))
  ) INTO result
  FROM agencies a
  LEFT JOIN clients c ON c.agency_id = a.id AND c.status = 'active'
  LEFT JOIN agency_projects ap ON ap.agency_id = a.id
  LEFT JOIN websites w ON w.id = ap.website_id
  WHERE a.id = agency_uuid;

  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- COMPLETION
-- ============================================

-- Insert a comment to mark this migration as applied
COMMENT ON TABLE agencies IS 'Agency platform v1.0 - B2B wrapper around B2C system';

-- Grant necessary permissions (if using Supabase)
-- GRANT ALL ON agencies TO authenticated;
-- GRANT ALL ON clients TO authenticated;
-- GRANT ALL ON agency_projects TO authenticated;
