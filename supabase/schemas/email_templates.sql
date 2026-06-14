-- Table
CREATE TABLE public.email_templates (
  id         serial PRIMARY KEY,
  name       varchar(100) NOT NULL UNIQUE,
  subject    text NOT NULL,
  html       text NOT NULL,
  variables  text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated can read email_templates"
ON public.email_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "admin can manage email_templates"
ON public.email_templates FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Permissions
REVOKE ALL ON public.email_templates FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
