DROP TABLE IF EXISTS public.workspace_invitations CASCADE;
DROP TABLE IF EXISTS public.workspace_members CASCADE;
DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP TYPE IF EXISTS public.workspace_role CASCADE;
DROP TYPE IF EXISTS public.invitation_status CASCADE;
DROP FUNCTION IF EXISTS public.is_workspace_member CASCADE;
DROP FUNCTION IF EXISTS public.get_workspace_member_role CASCADE;
DROP FUNCTION IF EXISTS public.add_workspace_owner CASCADE;
DROP FUNCTION IF EXISTS public.set_workspaces_updated_at CASCADE;
DROP FUNCTION IF EXISTS public.get_workspace_owner CASCADE;

CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member', 'guest');

CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined');

CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role public.workspace_role DEFAULT 'member' NOT NULL,
  invited_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at timestamptz,
  invited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  PRIMARY KEY (workspace_id, id)
);

CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.workspace_role DEFAULT 'member',
  status public.invitation_status DEFAULT 'pending',
  invited_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),

  UNIQUE(workspace_id, email)
);

CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
    AND id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_workspace_member_role(p_workspace_id uuid, p_user_id uuid)
RETURNS public.workspace_role AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = p_workspace_id
  AND id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.get_workspace_owner(p_workspace_id uuid)
RETURNS uuid AS $$
  SELECT owner_id FROM public.workspaces WHERE id = p_workspace_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- workspaces
CREATE POLICY "Users can see workspaces they are members of"
ON public.workspaces FOR SELECT
USING (
  public.is_workspace_member(id, (SELECT auth.uid()))
  OR owner_id = (SELECT auth.uid())
);

CREATE POLICY "Users can create workspaces"
ON public.workspaces FOR INSERT
WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Workspace owners/admins can update workspace"
ON public.workspaces FOR UPDATE
USING (
  public.get_workspace_member_role(id, (SELECT auth.uid())) IN ('owner', 'admin')
);

CREATE POLICY "Only workspace owner can delete workspace"
ON public.workspaces FOR DELETE
USING (owner_id = (SELECT auth.uid()));

-- workspace_members
CREATE POLICY "Members can see other members in same workspace"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id, (SELECT auth.uid())));

CREATE POLICY "Admins/owners can add members"
ON public.workspace_members FOR INSERT
WITH CHECK (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
);

CREATE POLICY "Admins/owners can update members"
ON public.workspace_members FOR UPDATE
USING (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
);

CREATE POLICY "Admins/owners can remove members"
ON public.workspace_members FOR DELETE
USING (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
);

-- workspace_invitations
CREATE POLICY "Admins/owners can see invitations"
ON public.workspace_invitations FOR SELECT
USING (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
  OR email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Admins/owners can create invitations"
ON public.workspace_invitations FOR INSERT
WITH CHECK (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
);

-- Triggers
CREATE OR REPLACE FUNCTION public.add_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, id, role, invited_by_id, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_workspace_created ON public.workspaces;
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW
  EXECUTE PROCEDURE public.add_workspace_owner();

CREATE OR REPLACE FUNCTION public.set_workspaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_workspaces_updated_at ON public.workspaces;
CREATE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_workspaces_updated_at();

DROP TRIGGER IF EXISTS set_workspace_members_updated_at ON public.workspace_members;
CREATE TRIGGER set_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_workspaces_updated_at();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_id ON public.workspace_members(id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_id ON public.workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON public.workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON public.workspace_invitations(email);
