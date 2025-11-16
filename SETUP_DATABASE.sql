-- ============================================
-- WebChat.ai - Complete Database Setup
-- Run this in Supabase SQL Editor
-- ============================================

-- This file combines all essential migrations
-- Copy and paste this entire file into Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- STEP 1: Create all tables
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_status VARCHAR(20) DEFAULT 'active',
  subscription_started_at TIMESTAMP,
  subscription_ends_at TIMESTAMP,
  stripe_customer_id VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- Websites table
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  html_code TEXT,
  css_code TEXT,
  js_code TEXT,
  subdomain VARCHAR(100) UNIQUE,
  custom_domain VARCHAR(255),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  last_deployed_at TIMESTAMP,
  template_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  preview_image_url TEXT,
  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Versions table (for version history)
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  html_code TEXT,
  css_code TEXT,
  js_code TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'usd',
  status VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- STEP 2: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_websites_user_id ON websites(user_id);
CREATE INDEX IF NOT EXISTS idx_websites_subdomain ON websites(subdomain);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_website_id ON chat_sessions(website_id);
CREATE INDEX IF NOT EXISTS idx_versions_website_id ON versions(website_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- ============================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Create RLS Policies
-- ============================================

-- Users policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Websites policies
CREATE POLICY "Users can view own websites" ON websites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own websites" ON websites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own websites" ON websites
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own websites" ON websites
  FOR DELETE USING (auth.uid() = user_id);

-- Chat sessions policies
CREATE POLICY "Users can view own chat sessions" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions" ON chat_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Versions policies
CREATE POLICY "Users can view versions of own websites" ON versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM websites
      WHERE websites.id = versions.website_id
      AND websites.user_id = auth.uid()
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Templates are public (read-only)
CREATE POLICY "Anyone can view templates" ON templates
  FOR SELECT USING (true);

-- ============================================
-- STEP 5: Create triggers
-- ============================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_websites_updated_at ON websites;
CREATE TRIGGER update_websites_updated_at
  BEFORE UPDATE ON websites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- STEP 6: Insert sample templates
-- ============================================

INSERT INTO templates (name, description, category, html_code, css_code, is_premium)
VALUES
(
  'Blank Template',
  'Start from scratch with a minimal template',
  'basic',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>My Website</title></head><body><h1>Welcome</h1><p>Start building your website!</p></body></html>',
  'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }',
  false
),
(
  'Business Landing Page',
  'Professional landing page for businesses',
  'business',
  '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Business</title></head><body><header><h1>Your Business Name</h1><nav><a href="#about">About</a><a href="#services">Services</a><a href="#contact">Contact</a></nav></header><main><section id="hero"><h2>Welcome to Our Business</h2><p>We provide excellent services</p></section></main></body></html>',
  'body { font-family: Arial, sans-serif; margin: 0; } header { background: #333; color: white; padding: 20px; }',
  false
)
ON CONFLICT DO NOTHING;

-- ============================================
-- SUCCESS!
-- ============================================

SELECT 'Database setup complete! ✅' AS status;
