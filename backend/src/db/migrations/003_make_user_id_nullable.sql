-- Make user_id nullable in chat_sessions to allow anonymous users
ALTER TABLE chat_sessions
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow anonymous access
DROP POLICY IF EXISTS "Users can manage own chat sessions" ON chat_sessions;

CREATE POLICY "Users can manage own chat sessions or anonymous"
  ON chat_sessions FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);
