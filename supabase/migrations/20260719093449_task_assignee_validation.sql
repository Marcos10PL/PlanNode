drop policy "Non-guest members can create tasks" on "public"."tasks";

drop policy "Non-guest members can update tasks" on "public"."tasks";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.clear_assignee_on_project_member_removed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.tasks
  SET assignee_id = NULL
  WHERE project_id = OLD.project_id
    AND assignee_id = OLD.id
    AND NOT public.can_access_project(OLD.project_id, OLD.id);
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.clear_assignee_on_workspace_member_removed()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.tasks t
  SET assignee_id = NULL
  FROM public.projects p
  WHERE p.id = t.project_id
    AND p.workspace_id = OLD.workspace_id
    AND t.assignee_id = OLD.id;
  RETURN OLD;
END;
$function$
;


  create policy "Non-guest members can create tasks"
  on "public"."tasks"
  as permissive
  for insert
  to public
with check ((public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)) AND (created_by = ( SELECT auth.uid() AS uid)) AND ((assignee_id IS NULL) OR public.can_access_project(project_id, assignee_id))));



  create policy "Non-guest members can update tasks"
  on "public"."tasks"
  as permissive
  for update
  to public
using (public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)))
with check ((public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)) AND ((assignee_id IS NULL) OR public.can_access_project(project_id, assignee_id))));


CREATE TRIGGER on_project_member_removed AFTER DELETE ON public.project_members FOR EACH ROW EXECUTE FUNCTION public.clear_assignee_on_project_member_removed();

CREATE TRIGGER on_workspace_member_removed_clear_assignee AFTER DELETE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.clear_assignee_on_workspace_member_removed();


