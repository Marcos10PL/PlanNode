set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_workspace_owner()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, id, role, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
  RETURN NEW;
END;
$function$
;

alter table "public"."workspace_members" drop constraint "workspace_members_invited_by_id_fkey";

alter table "public"."workspace_members" drop column "created_at";

alter table "public"."workspace_members" drop column "invited_by_id";
