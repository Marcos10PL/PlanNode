-- Table
CREATE TABLE public.app_config (
  key   text PRIMARY KEY,
  value jsonb NOT NULL
);

-- RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read app_config"
  ON public.app_config
  FOR SELECT
  TO authenticated
  USING (true);

-- Permissions
REVOKE ALL ON public.app_config FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.app_config FROM authenticated;
GRANT SELECT ON public.app_config TO authenticated;
GRANT ALL ON public.app_config TO service_role;
