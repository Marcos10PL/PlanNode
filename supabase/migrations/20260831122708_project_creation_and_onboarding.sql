drop trigger if exists "on_project_created" on "public"."projects";

drop policy "Admins/owners can add project members" on "public"."project_members";

revoke delete on table "public"."notification_preferences" from "anon";

revoke insert on table "public"."notification_preferences" from "anon";

revoke references on table "public"."notification_preferences" from "anon";

revoke select on table "public"."notification_preferences" from "anon";

revoke trigger on table "public"."notification_preferences" from "anon";

revoke truncate on table "public"."notification_preferences" from "anon";

revoke update on table "public"."notification_preferences" from "anon";

drop function if exists "public"."add_default_task_list"();

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

  INSERT INTO public.task_lists (project_id, name, position)
  VALUES (v_project_id, p_list_name, 0)
  RETURNING id INTO v_list_id;

  INSERT INTO public.project_members (project_id, id, added_by_id)
  VALUES (v_project_id, auth.uid(), auth.uid());

  INSERT INTO public.tasks (project_id, list_id, title, description, status, position, created_by)
  VALUES
    (v_project_id, v_list_id, p_task1_title, p_task1_description, 'todo', 0, auth.uid()),
    (v_project_id, v_list_id, p_task2_title, p_task2_description, 'in_progress', 1, auth.uid()),
    (v_project_id, v_list_id, p_task3_title, NULL, 'done', 2, auth.uid());

  RETURN QUERY SELECT v_project_id, v_list_id;
END;
$function$
;

revoke execute on function public.create_onboarding_workspace(
  text, text, text, text, text, text, text, text, text
) from anon;

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

  INSERT INTO public.task_lists (project_id, name, position)
  VALUES (v_project_id, p_list_name, 0);

  INSERT INTO public.project_members (project_id, id, added_by_id)
  VALUES (v_project_id, auth.uid(), auth.uid());

  RETURN v_project_id;
END;
$function$
;

revoke execute on function public.create_project_with_default_list(
  uuid, text, text, boolean, text, text, integer, text
) from anon;

CREATE OR REPLACE FUNCTION public.is_project_creator(p_project_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id AND p.created_by = p_user_id
  );
$function$
;

revoke execute on function public.is_project_creator(uuid, uuid) from anon;

  create policy "Admins/owners or creators can add project members"
  on "public"."project_members"
  as permissive
  for insert
  to public
with check ((public.is_project_manager(project_id, ( SELECT auth.uid() AS uid)) OR ((id = ( SELECT auth.uid() AS uid)) AND public.is_project_creator(project_id, ( SELECT auth.uid() AS uid)))));



