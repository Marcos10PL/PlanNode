drop policy "Admins/owners can create invitations" on "public"."workspace_invitations";

drop policy "Admins/owners can add members" on "public"."workspace_members";

drop policy "Admins/owners can update members" on "public"."workspace_members";

drop policy "Invited users can join workspace" on "public"."workspace_members";

drop function if exists "public"."delete_invitation_notification"(p_invitation_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_invitation_notification(p_invitation_id uuid, p_workspace_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  DELETE FROM public.notifications
  WHERE metadata->>'invitationId' = p_invitation_id::text
    AND public.get_workspace_member_role(p_workspace_id, auth.uid()) IN ('owner', 'admin');
$function$
;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type public.notification_type, p_metadata jsonb DEFAULT NULL::jsonb, p_link text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  INSERT INTO public.notifications (user_id, type, metadata, link)
  SELECT p_user_id, p_type, p_metadata, p_link
  WHERE (
    -- caller may always notify themselves
    auth.uid() = p_user_id
    -- or notify someone who shares a workspace with them (covers
    -- task_assigned, project_member_added, task_comment_added,
    -- workspace_role_changed - all fire between existing co-members)
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

CREATE OR REPLACE FUNCTION public.create_project_with_default_list(p_workspace_id uuid, p_name text, p_description text, p_is_private boolean, p_icon text, p_color text, p_position integer, p_list_name text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_project_id uuid;
BEGIN
  INSERT INTO public.projects (
    workspace_id, name, description, is_private, icon, color, position, created_by
  )
  VALUES (
    p_workspace_id, p_name, p_description, p_is_private, p_icon, p_color, p_position, auth.uid()
  )
  RETURNING id INTO v_project_id;

  INSERT INTO public.project_members (project_id, id, added_by_id)
  VALUES (v_project_id, auth.uid(), auth.uid());

  INSERT INTO public.task_lists (project_id, name, position, created_by)
  VALUES (v_project_id, p_list_name, 0, auth.uid());

  RETURN v_project_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.transfer_workspace_ownership(p_workspace_id uuid, p_new_owner_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
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
$function$
;


  create policy "Admins/owners can create invitations"
  on "public"."workspace_invitations"
  as permissive
  for insert
  to public
with check (((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])) AND (role <> 'owner'::public.workspace_role)));



  create policy "Admins/owners can add members"
  on "public"."workspace_members"
  as permissive
  for insert
  to public
with check (((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])) AND (role <> 'owner'::public.workspace_role)));



  create policy "Admins/owners can update members"
  on "public"."workspace_members"
  as permissive
  for update
  to public
using ((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])))
with check ((role <> 'owner'::public.workspace_role));



  create policy "Invited users can join workspace"
  on "public"."workspace_members"
  as permissive
  for insert
  to public
with check (((id = ( SELECT auth.uid() AS uid)) AND (role <> 'owner'::public.workspace_role) AND (EXISTS ( SELECT 1
   FROM (public.workspace_invitations wi
     JOIN public.profiles p ON ((p.email = wi.email)))
  WHERE ((wi.workspace_id = workspace_members.workspace_id) AND (p.id = ( SELECT auth.uid() AS uid)) AND (wi.status = 'pending'::public.invitation_status) AND (wi.expires_at > now()))))));

GRANT EXECUTE ON FUNCTION public.delete_invitation_notification(uuid, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.delete_invitation_notification(uuid, uuid) FROM anon;

REVOKE EXECUTE ON FUNCTION public.validate_subtask_parent() FROM anon;
REVOKE EXECUTE ON FUNCTION public.enforce_private_project_change() FROM anon;
REVOKE EXECUTE ON FUNCTION public.clear_assignee_on_project_member_removed() FROM anon;
REVOKE EXECUTE ON FUNCTION public.clear_assignee_on_workspace_member_removed() FROM anon;



