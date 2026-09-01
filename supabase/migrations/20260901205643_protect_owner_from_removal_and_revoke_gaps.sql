drop policy "Admins/owners can remove members" on "public"."workspace_members";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type public.notification_type, p_metadata jsonb DEFAULT NULL::jsonb, p_link text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
$function$
;


  create policy "Admins/owners can remove members"
  on "public"."workspace_members"
  as permissive
  for delete
  to public
using (((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])) AND (role <> 'owner'::public.workspace_role)));

REVOKE EXECUTE ON FUNCTION public.cancel_email_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.reorder_tasks(uuid, jsonb) FROM anon;



