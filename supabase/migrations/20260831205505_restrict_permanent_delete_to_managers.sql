drop policy "Managers or creators can delete projects" on "public"."projects";

drop policy "Managers or creators can delete task lists" on "public"."task_lists";

  create policy "Managers can delete projects"
  on "public"."projects"
  as permissive
  for delete
  to public
using (public.is_project_manager(id, ( SELECT auth.uid() AS uid)));



  create policy "Managers can delete task lists"
  on "public"."task_lists"
  as permissive
  for delete
  to public
using (public.is_project_manager(project_id, ( SELECT auth.uid() AS uid)));



