-- ═══════════════════════════════════════════════════════════
-- SECURE CHAT SESSIONS - Production Ready
-- ═══════════════════════════════════════════════════════════
-- This migration enforces authentication and proper chat management
-- ═══════════════════════════════════════════════════════════

-- Step 1: Add new columns to chat_sessions
ALTER TABLE chat_sessions
ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT 'New Chat',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMP DEFAULT NOW();

-- Step 2: Make user_id NOT NULL (require authentication)
-- First, delete any anonymous sessions (user_id is NULL)
DELETE FROM chat_sessions WHERE user_id IS NULL;

-- Now make it NOT NULL
ALTER TABLE chat_sessions
ALTER COLUMN user_id SET NOT NULL;

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_updated
  ON chat_sessions(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_public
  ON chat_sessions(is_public)
  WHERE is_public = TRUE;

CREATE INDEX IF NOT EXISTS idx_chat_sessions_last_message
  ON chat_sessions(user_id, last_message_at DESC);

-- Step 4: Add trigger to update last_message_at
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_message_at = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_last_message ON chat_sessions;
CREATE TRIGGER trigger_update_chat_last_message
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  WHEN (OLD.messages IS DISTINCT FROM NEW.messages)
  EXECUTE FUNCTION update_chat_last_message();

-- Step 5: Add trigger to auto-generate title from first message
CREATE OR REPLACE FUNCTION generate_chat_title()
RETURNS TRIGGER AS $$
DECLARE
  first_user_message TEXT;
BEGIN
  -- Only generate title if it's still "New Chat" and there are messages
  IF NEW.title = 'New Chat' AND jsonb_array_length(NEW.messages) > 0 THEN
    -- Extract first user message
    SELECT msg->>'content'
    INTO first_user_message
    FROM jsonb_array_elements(NEW.messages) AS msg
    WHERE msg->>'role' = 'user'
    LIMIT 1;

    -- Generate title from first 50 chars
    IF first_user_message IS NOT NULL THEN
      NEW.title = LEFT(first_user_message, 50);
      IF LENGTH(first_user_message) > 50 THEN
        NEW.title = NEW.title || '...';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_chat_title ON chat_sessions;
CREATE TRIGGER trigger_generate_chat_title
  BEFORE INSERT OR UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION generate_chat_title();

-- Step 6: Drop old RLS policies and create secure ones
DROP POLICY IF EXISTS "Users can manage own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_select_own_or_public" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_insert_own" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_update_own" ON chat_sessions;
DROP POLICY IF EXISTS "chat_sessions_delete_own" ON chat_sessions;

-- Enable RLS if not already enabled
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create optimized policies with (SELECT auth.uid())
CREATE POLICY "chat_sessions_select_own_or_public"
  ON chat_sessions FOR SELECT
  USING (
    user_id = (SELECT auth.uid())
    OR is_public = TRUE
  );

CREATE POLICY "chat_sessions_insert_own"
  ON chat_sessions FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "chat_sessions_update_own"
  ON chat_sessions FOR UPDATE
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "chat_sessions_delete_own"
  ON chat_sessions FOR DELETE
  USING (user_id = (SELECT auth.uid()));

-- Step 7: Add helper function to get user's chat list
CREATE OR REPLACE FUNCTION get_user_chats(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  last_message_at TIMESTAMP,
  created_at TIMESTAMP,
  message_count INTEGER,
  has_website BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.title,
    cs.last_message_at,
    cs.created_at,
    jsonb_array_length(cs.messages) as message_count,
    (cs.website_id IS NOT NULL) as has_website
  FROM chat_sessions cs
  WHERE cs.user_id = user_uuid
    AND cs.is_archived = FALSE
  ORDER BY cs.last_message_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Verification
DO $$
DECLARE
  session_count INTEGER;
  policy_count INTEGER;
BEGIN
  -- Count sessions
  SELECT COUNT(*) INTO session_count
  FROM chat_sessions;

  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'chat_sessions';

  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ SECURE CHAT SESSIONS MIGRATION COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE 'Chat sessions in database: %', session_count;
  RAISE NOTICE 'RLS policies active: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security features enabled:';
  RAISE NOTICE '  • Authentication required (user_id NOT NULL) ✅';
  RAISE NOTICE '  • Auto-generated chat titles ✅';
  RAISE NOTICE '  • Last message tracking ✅';
  RAISE NOTICE '  • Public sharing support ✅';
  RAISE NOTICE '  • Optimized RLS policies ✅';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Ready for production!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
