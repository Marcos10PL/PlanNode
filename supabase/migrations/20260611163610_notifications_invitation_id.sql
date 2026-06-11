set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_notification(p_invitation_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  DELETE FROM public.notifications WHERE metadata->>'invitationId' = p_invitation_id::text;
$function$
;


