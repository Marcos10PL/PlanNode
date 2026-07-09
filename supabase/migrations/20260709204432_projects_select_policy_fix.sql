drop policy "Members can see accessible projects" on "public"."projects";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_default_task_list()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.task_lists (project_id, name, position)
  VALUES (NEW.id, 'Tasks', 0);

  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, id, added_by_id)
    VALUES (NEW.id, NEW.created_by, NEW.created_by);
  END IF;

  RETURN NEW;
END;
$function$
;


  create policy "Members can see accessible projects"
  on "public"."projects"
  as permissive
  for select
  to public
using ((public.is_workspace_member(workspace_id, ( SELECT auth.uid() AS uid)) AND ((NOT is_private) OR (public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])) OR (EXISTS ( SELECT 1
   FROM public.project_members pm
  WHERE ((pm.project_id = projects.id) AND (pm.id = ( SELECT auth.uid() AS uid))))))));



