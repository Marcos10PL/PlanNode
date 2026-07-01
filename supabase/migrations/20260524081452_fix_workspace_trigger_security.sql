set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_workspace_owner()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, id, role, invited_by_id, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id, NOW());
  RETURN NEW;
END;
$function$
;


