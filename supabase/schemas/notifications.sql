-- Type
CREATE TYPE public.notification_type AS ENUM (
  'workspace_invitation',
  'task_assigned',
  'project_member_added',
  'task_comment_added',
  'workspace_role_changed'
);

-- Table
CREATE TABLE public.notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type       public.notification_type NOT NULL,
  metadata   jsonb,
  link       text,
  read_at    timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX idx_notifications_unread ON public.notifications (user_id, read_at) WHERE read_at IS NULL;

-- RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users can delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (user_id = (SELECT auth.uid()));

-- Preferences
CREATE TABLE public.notification_preferences (
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type           public.notification_type NOT NULL,
  email_enabled  boolean NOT NULL DEFAULT true,
  in_app_enabled boolean NOT NULL DEFAULT true,
  PRIMARY KEY (user_id, type)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see own notification preferences"
ON public.notification_preferences FOR SELECT TO authenticated
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users insert own notification preferences"
ON public.notification_preferences FOR INSERT TO authenticated
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users update own notification preferences"
ON public.notification_preferences FOR UPDATE TO authenticated
USING (user_id = (SELECT auth.uid()));

REVOKE ALL ON public.notification_preferences FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id  uuid,
  p_type     public.notification_type,
  p_metadata jsonb    DEFAULT NULL,
  p_link     text     DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.notifications (user_id, type, metadata, link)
  SELECT p_user_id, p_type, p_metadata, p_link
  WHERE (
    auth.uid() = p_user_id
    OR EXISTS (
      SELECT 1 FROM public.workspace_members caller
      JOIN public.workspace_members target ON target.workspace_id = caller.workspace_id
      WHERE caller.id = auth.uid() AND target.id = p_user_id
    )
    OR (
      p_type = 'workspace_invitation'
      AND EXISTS (
        SELECT 1 FROM public.workspace_invitations wi
        JOIN public.profiles p ON p.email = wi.email
        WHERE p.id = p_user_id
          AND wi.id = (p_metadata->>'invitationId')::uuid
          AND public.get_workspace_member_role(wi.workspace_id, auth.uid()) IN ('owner', 'admin')
      )
    )
  )
  AND COALESCE(
    (SELECT in_app_enabled FROM public.notification_preferences
     WHERE user_id = p_user_id AND type = p_type),
    true
  );
$$;

GRANT EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, jsonb, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, jsonb, text) FROM anon;

CREATE OR REPLACE FUNCTION public.get_email_notification_enabled(
  p_user_id uuid,
  p_type    public.notification_type
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT email_enabled FROM public.notification_preferences
     WHERE user_id = p_user_id AND type = p_type),
    true
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_email_notification_enabled(uuid, public.notification_type) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_email_notification_enabled(uuid, public.notification_type) FROM anon;

REVOKE ALL ON public.notifications FROM anon;
REVOKE INSERT ON public.notifications FROM authenticated;
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- p_workspace_id is required so the caller's manager rights can be checked
-- even after the invitation row itself has already been deleted (revoking
-- an invitation deletes the invitation row before cleaning up its notification).
CREATE OR REPLACE FUNCTION public.delete_invitation_notification(
  p_invitation_id uuid,
  p_workspace_id  uuid
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.notifications
  WHERE metadata->>'invitationId' = p_invitation_id::text
    AND public.get_workspace_member_role(p_workspace_id, auth.uid()) IN ('owner', 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.delete_invitation_notification(uuid, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_invitation_notification(uuid, uuid) FROM anon;

ALTER publication supabase_realtime
ADD TABLE public.notifications;