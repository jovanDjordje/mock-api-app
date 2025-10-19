-- ENABLE ROW LEVEL SECURITY
-- This prevents direct database access via the public anon key
-- Only authenticated API requests (server-side) will work

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running this script)
DROP POLICY IF EXISTS "Block all direct access to users" ON users;
DROP POLICY IF EXISTS "Block all direct access to projects" ON projects;
DROP POLICY IF EXISTS "Block all direct access to endpoints" ON endpoints;
DROP POLICY IF EXISTS "Block all direct access to api_keys" ON api_keys;

-- Users table: Block ALL direct access (only server-side API can access)
CREATE POLICY "Block all direct access to users" ON users
  FOR ALL USING (false);

-- Projects table: Block ALL direct access
CREATE POLICY "Block all direct access to projects" ON projects
  FOR ALL USING (false);

-- Endpoints table: Block ALL direct access
CREATE POLICY "Block all direct access to endpoints" ON endpoints
  FOR ALL USING (false);

-- API Keys table: Block ALL direct access
CREATE POLICY "Block all direct access to api_keys" ON api_keys
  FOR ALL USING (false);

-- Optional: If you want to see what policies are enabled
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies
-- WHERE schemaname = 'public';
