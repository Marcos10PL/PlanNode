-- Types
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member', 'guest');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- Tables
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role public.workspace_role DEFAULT 'member' NOT NULL,
  invited_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at timestamptz,
  invited_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  PRIMARY KEY (workspace_id, id)
);

CREATE TABLE public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.workspace_role DEFAULT 'member',
  status public.invitation_status DEFAULT 'pending',
  invited_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX workspace_invitations_workspace_id_email_pending_key
  ON public.workspace_invitations (workspace_id, email)
  WHERE status = 'pending';

-- RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Helper functions
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

-- Policies: workspaces
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

-- Policies: workspace_members
CREATE POLICY "Members can see other members in same workspace"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id, (SELECT auth.uid())));

CREATE POLICY "Admins/owners can add members"
ON public.workspace_members FOR INSERT
WITH CHECK (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
);

-- Allows invited users to accept their invitation by inserting their own membership
CREATE POLICY "Invited users can join workspace"
ON public.workspace_members FOR INSERT
WITH CHECK (
  id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.workspace_invitations wi
    JOIN public.profiles p ON p.email = wi.email
    WHERE wi.workspace_id = workspace_members.workspace_id
      AND p.id = (SELECT auth.uid())
      AND wi.status = 'pending'
      AND wi.expires_at > now()
  )
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

CREATE POLICY "Members can leave workspace"
ON public.workspace_members FOR DELETE
USING (
  id = (SELECT auth.uid())
  AND role != 'owner'::public.workspace_role
);

-- Policies: workspace_invitations
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

CREATE POLICY "Invited users can update their invitation status"
ON public.workspace_invitations FOR UPDATE
USING (
  email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid()))
)
WITH CHECK (
  email = (SELECT email FROM public.profiles WHERE id = (SELECT auth.uid()))
);

CREATE POLICY "Admins/owners can revoke invitations"
ON public.workspace_invitations FOR DELETE
USING (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
);

-- Trigger: add creator as owner when workspace is created
CREATE OR REPLACE FUNCTION public.add_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, id, role, invited_by_id, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE PROCEDURE public.add_workspace_owner();

-- Trigger: update updated_at on workspace/member changes
CREATE OR REPLACE FUNCTION public.set_workspaces_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

CREATE OR REPLACE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE PROCEDURE public.set_workspaces_updated_at();

CREATE OR REPLACE TRIGGER set_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW EXECUTE PROCEDURE public.set_workspaces_updated_at();

-- Indexes
CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_id ON public.workspace_members(id);
CREATE INDEX idx_workspace_invitations_workspace_id ON public.workspace_invitations(workspace_id);
CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations(token);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations(email);

-- Permissions
REVOKE SELECT ON public.workspaces FROM anon;
REVOKE SELECT ON public.workspace_members FROM anon;
REVOKE SELECT ON public.workspace_invitations FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_workspace_member_role(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_workspace_owner(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.add_workspace_owner() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_workspaces_updated_at() FROM anon;
