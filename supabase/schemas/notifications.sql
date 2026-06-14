-- Type
CREATE TYPE public.notification_type AS ENUM ('workspace_invitation');

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

-- SECURITY DEFINER helper: lets server actions create notifications for any user
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
  VALUES (p_user_id, p_type, p_metadata, p_link);
$$;

GRANT EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, jsonb, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, jsonb, text) FROM anon;

CREATE OR REPLACE FUNCTION public.delete_invitation_notification(p_invitation_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.notifications WHERE metadata->>'invitationId' = p_invitation_id::text;
$$;

GRANT EXECUTE ON FUNCTION public.delete_invitation_notification(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_invitation_notification(uuid) FROM anon;
