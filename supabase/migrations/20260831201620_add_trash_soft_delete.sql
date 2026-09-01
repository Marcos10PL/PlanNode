drop policy "Non-guest members can delete accessible projects" on "public"."projects";

drop policy "Non-guest members can delete task lists" on "public"."task_lists";

drop policy "Non-guest members can delete tasks" on "public"."tasks";

drop policy "Non-guest members can create task lists" on "public"."task_lists";

alter table "public"."projects" add column "deleted_at" timestamp with time zone;

alter table "public"."task_lists" add column "created_by" uuid;

alter table "public"."task_lists" add column "deleted_at" timestamp with time zone;

alter table "public"."tasks" add column "deleted_at" timestamp with time zone;

alter table "public"."task_lists" add constraint "task_lists_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."task_lists" validate constraint "task_lists_created_by_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_onboarding_workspace(p_workspace_name text, p_project_name text, p_project_description text, p_list_name text, p_task1_title text, p_task1_description text, p_task2_title text, p_task2_description text, p_task3_title text)
 RETURNS TABLE(project_id uuid, list_id uuid)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_workspace_id uuid;
  v_project_id   uuid;
  v_list_id      uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.workspaces WHERE owner_id = auth.uid()) THEN
    RETURN;
  END IF;

  INSERT INTO public.workspaces (owner_id, name)
  VALUES (auth.uid(), p_workspace_name)
  RETURNING id INTO v_workspace_id;

  INSERT INTO public.projects (workspace_id, name, description, created_by)
  VALUES (v_workspace_id, p_project_name, p_project_description, auth.uid())
  RETURNING id INTO v_project_id;

  INSERT INTO public.project_members (project_id, id, added_by_id)
  VALUES (v_project_id, auth.uid(), auth.uid());

  INSERT INTO public.task_lists (project_id, name, position, created_by)
  VALUES (v_project_id, p_list_name, 0, auth.uid())
  RETURNING id INTO v_list_id;

  INSERT INTO public.tasks (project_id, list_id, title, description, status, position, created_by)
  VALUES
    (v_project_id, v_list_id, p_task1_title, p_task1_description, 'todo', 0, auth.uid()),
    (v_project_id, v_list_id, p_task2_title, p_task2_description, 'in_progress', 1, auth.uid()),
    (v_project_id, v_list_id, p_task3_title, NULL, 'done', 2, auth.uid());

  RETURN QUERY SELECT v_project_id, v_list_id;
END;
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


  create policy "Managers or creators can delete projects"
  on "public"."projects"
  as permissive
  for delete
  to public
using ((public.is_project_manager(id, ( SELECT auth.uid() AS uid)) OR (created_by = ( SELECT auth.uid() AS uid))));



  create policy "Managers or creators can delete task lists"
  on "public"."task_lists"
  as permissive
  for delete
  to public
using ((public.is_project_manager(project_id, ( SELECT auth.uid() AS uid)) OR (created_by = ( SELECT auth.uid() AS uid))));



  create policy "Managers or creators can delete tasks"
  on "public"."tasks"
  as permissive
  for delete
  to public
using ((public.is_project_manager(project_id, ( SELECT auth.uid() AS uid)) OR (created_by = ( SELECT auth.uid() AS uid))));



  create policy "Non-guest members can create task lists"
  on "public"."task_lists"
  as permissive
  for insert
  to public
with check ((public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)) AND (created_by = ( SELECT auth.uid() AS uid))));



