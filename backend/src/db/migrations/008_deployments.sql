-- Deployments table
CREATE TABLE IF NOT EXISTS public.deployments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  vercel_deployment_id TEXT NOT NULL,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'deploying', -- deploying, ready, error
  custom_domain TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own deployments" ON public.deployments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create deployments for own projects" ON public.deployments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = deployments.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Index
CREATE INDEX idx_deployments_project_id ON public.deployments(project_id);
