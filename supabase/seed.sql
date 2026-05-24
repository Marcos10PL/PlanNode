INSERT INTO public.app_config (key, value) VALUES
  ('max_workspaces_per_user', '15') ON CONFLICT (key) DO NOTHING;