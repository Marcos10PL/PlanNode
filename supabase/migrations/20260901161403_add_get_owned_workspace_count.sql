set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_owned_workspace_count(p_user_id uuid)
 RETURNS integer
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT count(*)::integer FROM public.workspaces WHERE owner_id = p_user_id;
$function$
;

REVOKE EXECUTE ON FUNCTION public.get_owned_workspace_count(uuid) FROM anon;

