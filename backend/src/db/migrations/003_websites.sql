CREATE TABLE websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  subdomain VARCHAR(100) UNIQUE,

  html_code TEXT NOT NULL,
  css_code TEXT,
  js_code TEXT,

  theme VARCHAR(50),
  color_scheme JSONB,

  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,

  is_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMP,
  payment_amount DECIMAL(10, 2),

  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_websites_user ON websites(user_id);
CREATE INDEX idx_websites_subdomain ON websites(subdomain);

ALTER TABLE websites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own or published websites"
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
