set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.transfer_workspace_ownership(p_workspace_id uuid, p_new_owner_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF public.get_workspace_member_role(p_workspace_id, auth.uid()) IS DISTINCT FROM 'owner'::public.workspace_role THEN
    RAISE EXCEPTION 'Only the workspace owner can transfer ownership';
  END IF;

  IF p_new_owner_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot transfer ownership to yourself';
  END IF;

  IF NOT public.is_workspace_member(p_workspace_id, p_new_owner_id) THEN
    RAISE EXCEPTION 'Target user is not a member of this workspace';
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

REVOKE EXECUTE ON FUNCTION public.transfer_workspace_ownership(uuid, uuid) FROM anon;

