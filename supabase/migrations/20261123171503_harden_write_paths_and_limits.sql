drop trigger if exists "set_workspace_members_updated_at" on "public"."workspace_members";

drop trigger if exists "set_workspaces_updated_at" on "public"."workspaces";

drop policy "Authenticated users can view all profiles." on "public"."profiles";

drop policy "Non-guest members can create task events" on "public"."task_events";

drop policy "Admins/owners or creators can add project members" on "public"."project_members";

drop policy "Admins/owners can create invitations" on "public"."workspace_invitations";

drop policy "Invited users can join workspace" on "public"."workspace_members";

revoke references on table "public"."app_config" from "authenticated";

revoke trigger on table "public"."app_config" from "authenticated";

revoke truncate on table "public"."app_config" from "authenticated";

revoke references on table "public"."email_templates" from "authenticated";

revoke trigger on table "public"."email_templates" from "authenticated";

revoke truncate on table "public"."email_templates" from "authenticated";

revoke delete on table "public"."notification_preferences" from "authenticated";

revoke references on table "public"."notification_preferences" from "authenticated";

revoke trigger on table "public"."notification_preferences" from "authenticated";

revoke truncate on table "public"."notification_preferences" from "authenticated";

revoke references on table "public"."notifications" from "authenticated";

revoke trigger on table "public"."notifications" from "authenticated";

revoke truncate on table "public"."notifications" from "authenticated";

revoke update on table "public"."notifications" from "authenticated";

revoke references on table "public"."profiles" from "authenticated";

revoke trigger on table "public"."profiles" from "authenticated";

revoke truncate on table "public"."profiles" from "authenticated";

revoke update on table "public"."profiles" from "authenticated";

revoke references on table "public"."project_favorites" from "authenticated";

revoke trigger on table "public"."project_favorites" from "authenticated";

revoke truncate on table "public"."project_favorites" from "authenticated";

revoke references on table "public"."project_members" from "authenticated";

revoke trigger on table "public"."project_members" from "authenticated";

revoke truncate on table "public"."project_members" from "authenticated";

revoke update on table "public"."project_members" from "authenticated";

revoke references on table "public"."projects" from "authenticated";

revoke trigger on table "public"."projects" from "authenticated";

revoke truncate on table "public"."projects" from "authenticated";

revoke update on table "public"."projects" from "authenticated";

revoke references on table "public"."task_comments" from "authenticated";

revoke trigger on table "public"."task_comments" from "authenticated";

revoke truncate on table "public"."task_comments" from "authenticated";

revoke update on table "public"."task_comments" from "authenticated";

revoke delete on table "public"."task_events" from "authenticated";

revoke insert on table "public"."task_events" from "authenticated";

revoke references on table "public"."task_events" from "authenticated";

revoke trigger on table "public"."task_events" from "authenticated";

revoke truncate on table "public"."task_events" from "authenticated";

revoke update on table "public"."task_events" from "authenticated";

revoke references on table "public"."task_lists" from "authenticated";

revoke trigger on table "public"."task_lists" from "authenticated";

revoke truncate on table "public"."task_lists" from "authenticated";

revoke update on table "public"."task_lists" from "authenticated";

revoke references on table "public"."tasks" from "authenticated";

revoke trigger on table "public"."tasks" from "authenticated";

revoke truncate on table "public"."tasks" from "authenticated";

revoke update on table "public"."tasks" from "authenticated";

revoke references on table "public"."workspace_invitations" from "authenticated";

revoke trigger on table "public"."workspace_invitations" from "authenticated";

revoke truncate on table "public"."workspace_invitations" from "authenticated";

revoke update on table "public"."workspace_invitations" from "authenticated";

revoke references on table "public"."workspace_members" from "authenticated";

revoke trigger on table "public"."workspace_members" from "authenticated";

revoke truncate on table "public"."workspace_members" from "authenticated";

revoke update on table "public"."workspace_members" from "authenticated";

revoke references on table "public"."workspaces" from "authenticated";

revoke trigger on table "public"."workspaces" from "authenticated";

revoke truncate on table "public"."workspaces" from "authenticated";

revoke update on table "public"."workspaces" from "authenticated";

drop function if exists "public"."set_workspaces_updated_at"();

alter table "public"."email_templates" alter column "name" set data type text using "name"::text;

alter table "public"."notifications" add constraint "notifications_link_internal" CHECK (((link IS NULL) OR (("left"(link, 1) = '/'::text) AND ("left"(link, 2) <> ALL (ARRAY['//'::text, ('/'::text || chr(92))]))))) not valid;

alter table "public"."notifications" validate constraint "notifications_link_internal";

alter table "public"."profiles" add constraint "profiles_full_name_length" CHECK (((char_length(btrim(full_name)) >= 1) AND (char_length(btrim(full_name)) <= 100))) not valid;

alter table "public"."profiles" validate constraint "profiles_full_name_length";

alter table "public"."projects" add constraint "projects_color_allowed" CHECK ((color = ANY (ARRAY['neutral'::text, 'red'::text, 'orange'::text, 'amber'::text, 'yellow'::text, 'lime'::text, 'green'::text, 'emerald'::text, 'teal'::text, 'cyan'::text, 'sky'::text, 'blue'::text, 'indigo'::text, 'violet'::text, 'purple'::text, 'pink'::text]))) not valid;

alter table "public"."projects" validate constraint "projects_color_allowed";

alter table "public"."projects" add constraint "projects_description_length" CHECK ((char_length(description) <= 1500)) not valid;

alter table "public"."projects" validate constraint "projects_description_length";

alter table "public"."projects" add constraint "projects_icon_allowed" CHECK ((icon = ANY (ARRAY['folder-kanban'::text, 'rocket'::text, 'lightbulb'::text, 'bar-chart'::text, 'target'::text, 'shield'::text, 'wrench'::text, 'book'::text, 'globe'::text, 'heart'::text, 'zap'::text, 'flag'::text, 'briefcase'::text, 'calendar'::text, 'code'::text, 'palette'::text]))) not valid;

alter table "public"."projects" validate constraint "projects_icon_allowed";

alter table "public"."projects" add constraint "projects_name_length" CHECK (((char_length(btrim(name)) >= 1) AND (char_length(btrim(name)) <= 50))) not valid;

alter table "public"."projects" validate constraint "projects_name_length";

alter table "public"."task_comments" add constraint "task_comments_content_length" CHECK ((char_length(content) <= 40000)) not valid;

alter table "public"."task_comments" validate constraint "task_comments_content_length";

alter table "public"."task_lists" add constraint "task_lists_name_length" CHECK (((char_length(btrim(name)) >= 1) AND (char_length(btrim(name)) <= 50))) not valid;

alter table "public"."task_lists" validate constraint "task_lists_name_length";

alter table "public"."tasks" add constraint "tasks_description_length" CHECK ((char_length(description) <= 100000)) not valid;

alter table "public"."tasks" validate constraint "tasks_description_length";

alter table "public"."tasks" add constraint "tasks_title_length" CHECK (((char_length(btrim(title)) >= 1) AND (char_length(btrim(title)) <= 200))) not valid;

alter table "public"."tasks" validate constraint "tasks_title_length";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_email_length" CHECK ((char_length(email) <= 320)) not valid;

alter table "public"."workspace_invitations" validate constraint "workspace_invitations_email_length";

alter table "public"."workspaces" add constraint "workspaces_description_length" CHECK ((char_length(description) <= 500)) not valid;

alter table "public"."workspaces" validate constraint "workspaces_description_length";

alter table "public"."workspaces" add constraint "workspaces_name_length" CHECK (((char_length(btrim(name)) >= 1) AND (char_length(btrim(name)) <= 50))) not valid;

alter table "public"."workspaces" validate constraint "workspaces_name_length";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.log_task_events()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := auth.uid();
BEGIN
  IF v_user IS NULL OR pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.task_events (task_id, user_id, type, metadata)
    VALUES (NEW.id, v_user, 'task_created', '{}');
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.task_events (task_id, user_id, type, metadata)
    VALUES (NEW.id, v_user, 'status_changed', jsonb_build_object('from', OLD.status, 'to', NEW.status));
  END IF;

  IF NEW.priority IS DISTINCT FROM OLD.priority THEN
    INSERT INTO public.task_events (task_id, user_id, type, metadata)
    VALUES (NEW.id, v_user, 'priority_changed', jsonb_build_object('from', OLD.priority, 'to', NEW.priority));
  END IF;

  IF NEW.due_date IS DISTINCT FROM OLD.due_date THEN
    INSERT INTO public.task_events (task_id, user_id, type, metadata)
    VALUES (NEW.id, v_user, 'due_date_changed', jsonb_build_object('from', OLD.due_date, 'to', NEW.due_date));
  END IF;

  IF NEW.assignee_id IS DISTINCT FROM OLD.assignee_id THEN
    INSERT INTO public.task_events (task_id, user_id, type, metadata)
    VALUES (NEW.id, v_user, 'assignee_changed', jsonb_build_object('fromId', OLD.assignee_id, 'toId', NEW.assignee_id));
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reorder_tasks(p_list_id uuid, p_changes jsonb)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  UPDATE public.tasks t
  SET position = c.position,
      status = COALESCE(c.status, t.status)
  FROM jsonb_to_recordset(p_changes) AS c(id uuid, position integer, status public.task_status)
  WHERE t.id = c.id
    AND t.list_id = p_list_id;
$function$
;

CREATE OR REPLACE FUNCTION public.transfer_workspace_ownership(p_workspace_id uuid, p_new_owner_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  IF public.get_workspace_owner(p_workspace_id) IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Only the workspace owner can transfer ownership';
  END IF;

  IF p_new_owner_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot transfer ownership to yourself';
  END IF;

  IF NOT public.is_workspace_member(p_workspace_id, p_new_owner_id) THEN
    RAISE EXCEPTION 'Target user is not a member of this workspace';
  END IF;

  IF public.get_owned_workspace_count(p_new_owner_id) >= COALESCE(
    (SELECT (value #>> '{}')::integer FROM public.app_config WHERE key = 'max_workspaces_per_user'),
    15
  ) THEN
    RAISE EXCEPTION 'workspace_limit_reached';
  END IF;

  UPDATE public.workspaces
  SET owner_id = p_new_owner_id
  WHERE id = p_workspace_id;

  UPDATE public.workspace_members
  SET role = 'owner'
  WHERE workspace_id = p_workspace_id AND id = p_new_owner_id;

  UPDATE public.workspace_members
  SET role = 'admin'
  WHERE workspace_id = p_workspace_id AND id = auth.uid();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_view_profile(p_profile_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT p_profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.workspace_members me
      JOIN public.workspace_members other ON other.workspace_id = me.workspace_id
      WHERE me.id = auth.uid() AND other.id = p_profile_id
    )
    OR EXISTS (
      SELECT 1 FROM public.workspace_invitations wi
      JOIN public.profiles me ON me.email = wi.email
      WHERE me.id = auth.uid()
        AND wi.invited_by_id = p_profile_id
        AND wi.status = 'pending'
        AND wi.expires_at > now()
    );
$function$
;

CREATE OR REPLACE FUNCTION public.find_profile_by_email(p_workspace_id uuid, p_email text)
 RETURNS TABLE(id uuid, locale public.locale)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT p.id, p.locale FROM public.profiles p
  WHERE p.email = p_email
    AND public.get_workspace_member_role(p_workspace_id, auth.uid()) IN ('owner', 'admin');
$function$
;

create policy "Users can view profiles they share a workspace with"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (public.can_view_profile(id));


create policy "Admins/owners or creators can add project members"
  on "public"."project_members"
  as permissive
  for insert
  to public
with check ((public.is_project_manager(project_id, ( SELECT auth.uid() AS uid)) OR ((id = ( SELECT auth.uid() AS uid)) AND public.is_project_creator(project_id, ( SELECT auth.uid() AS uid)) AND public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)))));


create policy "Admins/owners can create invitations"
  on "public"."workspace_invitations"
  as permissive
  for insert
  to public
with check (((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])) AND (role <> 'owner'::public.workspace_role) AND (invited_by_id = ( SELECT auth.uid() AS uid)) AND (status = 'pending'::public.invitation_status)));


create policy "Invited users can join workspace"
  on "public"."workspace_members"
  as permissive
  for insert
  to public
with check (((id = ( SELECT auth.uid() AS uid)) AND (role <> 'owner'::public.workspace_role) AND (EXISTS ( SELECT 1
   FROM (public.workspace_invitations wi
     JOIN public.profiles p ON ((p.email = wi.email)))
  WHERE ((wi.workspace_id = workspace_members.workspace_id) AND (wi.role = workspace_members.role) AND (p.id = ( SELECT auth.uid() AS uid)) AND (wi.status = 'pending'::public.invitation_status) AND (wi.expires_at > now()))))));

CREATE TRIGGER log_task_events_trigger AFTER INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.log_task_events();

CREATE TRIGGER set_workspace_members_updated_at BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- migra does not generate column-level privileges or REVOKE EXECUTE, copied from the schema files
GRANT UPDATE (read_at) ON public.notifications TO authenticated;
GRANT UPDATE (full_name, locale) ON public.profiles TO authenticated;
GRANT UPDATE (name, description, is_private, is_completed, icon, color, position, deleted_at) ON public.projects TO authenticated;
GRANT UPDATE (name, position, deleted_at) ON public.task_lists TO authenticated;
GRANT UPDATE (title, description, status, priority, assignee_id, due_date, position, deleted_at) ON public.tasks TO authenticated;
GRANT UPDATE (content) ON public.task_comments TO authenticated;
GRANT UPDATE (name, description) ON public.workspaces TO authenticated;
GRANT UPDATE (role) ON public.workspace_members TO authenticated;
GRANT UPDATE (status) ON public.workspace_invitations TO authenticated;

REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, jsonb, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_email_notification_enabled(uuid, public.notification_type) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.delete_invitation_notification(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_user_email_update() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.cancel_email_change() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_onboarding_workspace( text, text, text, text, text, text, text, text, text ) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_access_project(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_project(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_project_manager(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_project_creator(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_project_with_default_list( uuid, text, text, boolean, text, text, integer, text ) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.reorder_tasks(uuid, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.log_task_events() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.validate_subtask_parent() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.enforce_private_project_change() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.clear_assignee_on_project_member_removed() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.clear_assignee_on_workspace_member_removed() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_workspace_member_role(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_workspace_owner(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_owned_workspace_count(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_view_profile(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.find_profile_by_email(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.add_workspace_owner() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.transfer_workspace_ownership(uuid, uuid) FROM PUBLIC, anon;

alter publication supabase_realtime add table public.projects;
