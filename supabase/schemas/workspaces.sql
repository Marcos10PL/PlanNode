-- Types
CREATE TYPE public.workspace_role AS ENUM ('owner', 'admin', 'member', 'guest');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- Tables
CREATE TABLE public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.workspace_members (
  id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role public.workspace_role DEFAULT 'member' NOT NULL,
  joined_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (workspace_id, id)
);

CREATE TABLE public.workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role public.workspace_role NOT NULL DEFAULT 'member',
  status public.invitation_status NOT NULL DEFAULT 'pending',
  invited_by_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- One pending invitation per email and workspace
CREATE UNIQUE INDEX workspace_invitations_workspace_id_email_pending_key
  ON public.workspace_invitations (workspace_id, email)
  WHERE status = 'pending';

-- Policy helper: is the user a member of this workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
    AND id = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- RPC: the user's role in a workspace (NULL if not a member)
CREATE OR REPLACE FUNCTION public.get_workspace_member_role(p_workspace_id uuid, p_user_id uuid)
RETURNS public.workspace_role AS $$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = p_workspace_id
  AND id = p_user_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- Helper: id of the workspace owner
CREATE OR REPLACE FUNCTION public.get_workspace_owner(p_workspace_id uuid)
RETURNS uuid AS $$
  SELECT owner_id FROM public.workspaces WHERE id = p_workspace_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- RPC: how many workspaces the user owns
CREATE OR REPLACE FUNCTION public.get_owned_workspace_count(p_user_id uuid)
RETURNS integer AS $$
  SELECT count(*)::integer FROM public.workspaces WHERE owner_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- Policy helper: can the user see this profile
CREATE OR REPLACE FUNCTION public.can_view_profile(p_profile_id uuid)
RETURNS boolean AS $$
  SELECT p_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspace_members me
      JOIN public.workspace_members other ON other.workspace_id = me.workspace_id
      WHERE me.id = auth.uid() AND other.id = p_profile_id
    )
    OR EXISTS (
      SELECT 1 FROM public.workspace_invitations wi
      JOIN public.profiles me ON me.email = wi.email
      WHERE me.id = auth.uid()
        AND wi.invited_by_id = p_profile_id
        AND wi.status = 'pending'
        AND wi.expires_at > now()
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- RPC: find an invitee by email (owners/admins only)
CREATE OR REPLACE FUNCTION public.find_profile_by_email(p_workspace_id uuid, p_email text)
RETURNS TABLE (id uuid, locale public.locale) AS $$
  SELECT p.id, p.locale FROM public.profiles p
  WHERE p.email = p_email
    AND public.get_workspace_member_role(p_workspace_id, auth.uid()) IN ('owner', 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

-- RLS
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles they share a workspace with"
ON public.profiles FOR SELECT TO authenticated
USING (public.can_view_profile(id));

CREATE POLICY "Users can see workspaces they are members of"
ON public.workspaces FOR SELECT
USING (
  public.is_workspace_member(id, (SELECT auth.uid()))
  OR owner_id = (SELECT auth.uid())
);

CREATE POLICY "Invited users can see workspace they are invited to"
ON public.workspaces FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_invitations wi
    JOIN public.profiles p ON p.email = wi.email
    WHERE wi.workspace_id = workspaces.id
      AND p.id = (SELECT auth.uid())
      AND wi.status = 'pending'
      AND wi.expires_at > now()
  )
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

CREATE POLICY "Members can see other members in same workspace"
ON public.workspace_members FOR SELECT
USING (public.is_workspace_member(workspace_id, (SELECT auth.uid())));

CREATE POLICY "Admins/owners can add members"
ON public.workspace_members FOR INSERT
WITH CHECK (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
  AND role != 'owner'::public.workspace_role
);

CREATE POLICY "Invited users can join workspace"
ON public.workspace_members FOR INSERT
WITH CHECK (
  id = (SELECT auth.uid())
  AND role != 'owner'::public.workspace_role
  AND EXISTS (
    SELECT 1 FROM public.workspace_invitations wi
    JOIN public.profiles p ON p.email = wi.email
    WHERE wi.workspace_id = workspace_members.workspace_id
      AND wi.role = workspace_members.role
      AND p.id = (SELECT auth.uid())
      AND wi.status = 'pending'
      AND wi.expires_at > now()
  )
);

CREATE POLICY "Admins/owners can update members"
ON public.workspace_members FOR UPDATE
USING (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
)
WITH CHECK (
  role != 'owner'::public.workspace_role
);

CREATE POLICY "Admins/owners can remove members"
ON public.workspace_members FOR DELETE
USING (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
  AND role != 'owner'::public.workspace_role
);

CREATE POLICY "Members can leave workspace"
ON public.workspace_members FOR DELETE
USING (
  id = (SELECT auth.uid())
  AND role != 'owner'::public.workspace_role
);

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
  AND role != 'owner'::public.workspace_role
  AND invited_by_id = (SELECT auth.uid())
  AND status = 'pending'
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
  INSERT INTO public.workspace_members (workspace_id, id, role, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE PROCEDURE public.add_workspace_owner();

-- RPC: owner-only, the target must be a member, the previous owner becomes admin
CREATE OR REPLACE FUNCTION public.transfer_workspace_ownership(
  p_workspace_id uuid,
  p_new_owner_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.get_workspace_owner(p_workspace_id) IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Only the workspace owner can transfer ownership';
  END IF;

  IF p_new_owner_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot transfer ownership to yourself';
  END IF;

  IF NOT public.is_workspace_member(p_workspace_id, p_new_owner_id) THEN
    RAISE EXCEPTION 'Target user is not a member of this workspace';
  END IF;

  IF public.get_owned_workspace_count(p_new_owner_id) >= COALESCE(
    (SELECT (value #>> '{}')::integer FROM public.app_config WHERE key = 'max_workspaces_per_user'),
    15
  ) THEN
    RAISE EXCEPTION 'workspace_limit_reached';
  END IF;

  UPDATE public.workspaces
  SET owner_id = p_new_owner_id
  WHERE id = p_workspace_id;

  UPDATE public.workspace_members
  SET role = 'owner'
  WHERE workspace_id = p_workspace_id AND id = p_new_owner_id;

  UPDATE public.workspace_members
  SET role = 'admin'
  WHERE workspace_id = p_workspace_id AND id = auth.uid();
END;
$$;

-- Triggers: update updated_at
CREATE OR REPLACE TRIGGER set_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE TRIGGER set_workspace_members_updated_at
  BEFORE UPDATE ON public.workspace_members
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Trigger: row limit from app_config (args: scope column, key, default, message, extra condition)
CREATE OR REPLACE FUNCTION public.enforce_row_limit()
RETURNS TRIGGER AS $$
DECLARE
  v_scope uuid := (to_jsonb(NEW) ->> TG_ARGV[0])::uuid;
  v_limit integer := COALESCE(
    (SELECT (value #>> '{}')::integer FROM public.app_config WHERE key = TG_ARGV[1]),
    TG_ARGV[2]::integer
  );
  v_count integer;
BEGIN
  EXECUTE format(
    'SELECT count(*) FROM (SELECT 1 FROM %I.%I WHERE %I = $1 AND (%s) LIMIT $2) s',
    TG_TABLE_SCHEMA, TG_TABLE_NAME, TG_ARGV[0], COALESCE(TG_ARGV[4], 'true')
  ) INTO v_count USING v_scope, v_limit;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION '%', TG_ARGV[3];
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER enforce_workspaces_limit
  BEFORE INSERT ON public.workspaces
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_row_limit(
    'owner_id', 'max_workspaces_per_user', '15', 'workspace_limit_reached'
  );

CREATE OR REPLACE TRIGGER enforce_workspace_members_limit
  BEFORE INSERT ON public.workspace_members
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_row_limit(
    'workspace_id', 'max_members_per_workspace', '50', 'member_limit_reached'
  );

-- pending, non-expired invitations only
CREATE OR REPLACE TRIGGER enforce_pending_invitations_limit
  BEFORE INSERT ON public.workspace_invitations
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_row_limit(
    'workspace_id', 'max_pending_invitations_per_workspace', '50',
    'invitation_limit_reached', 'status = ''pending'' AND expires_at > now()'
  );

-- Indexes
CREATE INDEX idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_id ON public.workspace_members(id);
CREATE INDEX idx_workspace_invitations_workspace_id ON public.workspace_invitations(workspace_id);
CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations(token);
CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations(email);
CREATE INDEX idx_workspace_invitations_status ON public.workspace_invitations(status);

-- Permissions
REVOKE ALL ON public.workspaces FROM anon;
REVOKE ALL ON public.workspace_members FROM anon;
REVOKE ALL ON public.workspace_invitations FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_workspace_member_role(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_workspace_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_owned_workspace_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_view_profile(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.find_profile_by_email(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_workspace_owner() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.transfer_workspace_ownership(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.enforce_row_limit() FROM PUBLIC, anon;
REVOKE ALL ON public.workspaces FROM authenticated;
REVOKE ALL ON public.workspace_members FROM authenticated;
REVOKE ALL ON public.workspace_invitations FROM authenticated;
GRANT SELECT, INSERT, DELETE ON public.workspaces TO authenticated;
GRANT UPDATE (name, description) ON public.workspaces TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.workspace_members TO authenticated;
GRANT UPDATE (role) ON public.workspace_members TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.workspace_invitations TO authenticated;
GRANT UPDATE (status) ON public.workspace_invitations TO authenticated;
GRANT ALL ON public.workspaces TO service_role;
GRANT ALL ON public.workspace_members TO service_role;
GRANT ALL ON public.workspace_invitations TO service_role;
