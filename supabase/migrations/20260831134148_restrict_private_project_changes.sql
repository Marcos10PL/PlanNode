drop policy "Non-guest members can create projects" on "public"."projects";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.enforce_private_project_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.is_private IS DISTINCT FROM OLD.is_private THEN
    IF public.get_workspace_member_role(NEW.workspace_id, auth.uid()) NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Only workspace owners and admins can change a project''s privacy setting';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

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

  INSERT INTO public.task_lists (project_id, name, position)
  VALUES (v_project_id, p_list_name, 0)
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

  -- inserted before task_lists: for a private project, can_access_project()
  -- (used by the task_lists INSERT policy) needs either a manager role or an
  -- existing project_members row — the creator's own row must exist first
  INSERT INTO public.project_members (project_id, id, added_by_id)
  VALUES (v_project_id, auth.uid(), auth.uid());

  INSERT INTO public.task_lists (project_id, name, position)
  VALUES (v_project_id, p_list_name, 0);

  RETURN v_project_id;
END;
$function$
;


  create policy "Create projects, private ones require manager role"
  on "public"."projects"
  as permissive
  for insert
  to public
with check (((created_by = ( SELECT auth.uid() AS uid)) AND (((NOT is_private) AND (public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role, 'member'::public.workspace_role]))) OR (is_private AND (public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role]))))));


CREATE TRIGGER enforce_private_project_change_trigger BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.enforce_private_project_change();


