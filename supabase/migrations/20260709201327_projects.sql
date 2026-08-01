create type "public"."task_priority" as enum ('low', 'medium', 'high', 'urgent');

create type "public"."task_status" as enum ('on_hold', 'todo', 'in_progress', 'in_review', 'in_tests', 'done', 'cancelled');

alter type "public"."notification_type" rename to "notification_type__old_version_to_be_dropped";

create type "public"."notification_type" as enum ('workspace_invitation', 'task_assigned');


  create table "public"."project_members" (
    "id" uuid not null,
    "project_id" uuid not null,
    "added_by_id" uuid,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."project_members" enable row level security;


  create table "public"."projects" (
    "id" uuid not null default gen_random_uuid(),
    "workspace_id" uuid not null,
    "name" text not null,
    "description" text,
    "is_private" boolean not null default false,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."projects" enable row level security;


  create table "public"."task_lists" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "name" text not null,
    "position" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."task_lists" enable row level security;


  create table "public"."tasks" (
    "id" uuid not null default gen_random_uuid(),
    "project_id" uuid not null,
    "list_id" uuid not null,
    "title" text not null,
    "description" text,
    "status" public.task_status not null default 'todo'::public.task_status,
    "priority" public.task_priority not null default 'medium'::public.task_priority,
    "assignee_id" uuid,
    "due_date" date,
    "position" integer not null default 0,
    "created_by" uuid,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."tasks" enable row level security;

alter table "public"."notifications" alter column type type "public"."notification_type" using type::text::"public"."notification_type";

drop function public.create_notification(uuid, public.notification_type__old_version_to_be_dropped, jsonb, text);

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id  uuid,
  p_type     public.notification_type,
  p_metadata jsonb    DEFAULT NULL,
  p_link     text     DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.notifications (user_id, type, metadata, link)
  VALUES (p_user_id, p_type, p_metadata, p_link);
$$;

GRANT EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, jsonb, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, public.notification_type, jsonb, text) FROM anon;

drop type "public"."notification_type__old_version_to_be_dropped";

CREATE INDEX idx_project_members_id ON public.project_members USING btree (id);

CREATE INDEX idx_projects_workspace_id ON public.projects USING btree (workspace_id);

CREATE INDEX idx_task_lists_project_id ON public.task_lists USING btree (project_id, "position");

CREATE INDEX idx_tasks_assignee_due ON public.tasks USING btree (assignee_id, due_date);

CREATE INDEX idx_tasks_list_id ON public.tasks USING btree (list_id, "position");

CREATE INDEX idx_tasks_project_id ON public.tasks USING btree (project_id);

CREATE INDEX idx_tasks_project_status ON public.tasks USING btree (project_id, status);

CREATE UNIQUE INDEX project_members_pkey ON public.project_members USING btree (project_id, id);

CREATE UNIQUE INDEX projects_pkey ON public.projects USING btree (id);

CREATE UNIQUE INDEX task_lists_id_project_id_key ON public.task_lists USING btree (id, project_id);

CREATE UNIQUE INDEX task_lists_pkey ON public.task_lists USING btree (id);

CREATE UNIQUE INDEX tasks_pkey ON public.tasks USING btree (id);

alter table "public"."project_members" add constraint "project_members_pkey" PRIMARY KEY using index "project_members_pkey";

alter table "public"."projects" add constraint "projects_pkey" PRIMARY KEY using index "projects_pkey";

alter table "public"."task_lists" add constraint "task_lists_pkey" PRIMARY KEY using index "task_lists_pkey";

alter table "public"."tasks" add constraint "tasks_pkey" PRIMARY KEY using index "tasks_pkey";

alter table "public"."project_members" add constraint "project_members_added_by_id_fkey" FOREIGN KEY (added_by_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."project_members" validate constraint "project_members_added_by_id_fkey";

alter table "public"."project_members" add constraint "project_members_id_fkey" FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."project_members" validate constraint "project_members_id_fkey";

alter table "public"."project_members" add constraint "project_members_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."project_members" validate constraint "project_members_project_id_fkey";

alter table "public"."projects" add constraint "projects_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."projects" validate constraint "projects_created_by_fkey";

alter table "public"."projects" add constraint "projects_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."projects" validate constraint "projects_workspace_id_fkey";

alter table "public"."task_lists" add constraint "task_lists_id_project_id_key" UNIQUE using index "task_lists_id_project_id_key";

alter table "public"."task_lists" add constraint "task_lists_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."task_lists" validate constraint "task_lists_project_id_fkey";

alter table "public"."tasks" add constraint "tasks_assignee_id_fkey" FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_assignee_id_fkey";

alter table "public"."tasks" add constraint "tasks_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_created_by_fkey";

alter table "public"."tasks" add constraint "tasks_list_id_project_id_fkey" FOREIGN KEY (list_id, project_id) REFERENCES public.task_lists(id, project_id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_list_id_project_id_fkey";

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
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.can_access_project(p_project_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id
      AND public.is_workspace_member(p.workspace_id, p_user_id)
      AND (
        NOT p.is_private
        OR public.get_workspace_member_role(p.workspace_id, p_user_id) IN ('owner', 'admin')
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p.id AND pm.id = p_user_id
        )
      )
  );
$function$
;

CREATE OR REPLACE FUNCTION public.can_edit_project(p_project_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT public.can_access_project(p_project_id, p_user_id)
    AND public.get_workspace_member_role(
      (SELECT workspace_id FROM public.projects WHERE id = p_project_id),
      p_user_id
    ) IN ('owner', 'admin', 'member');
$function$
;

CREATE OR REPLACE FUNCTION public.is_project_manager(p_project_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT public.get_workspace_member_role(
    (SELECT workspace_id FROM public.projects WHERE id = p_project_id),
    p_user_id
  ) IN ('owner', 'admin');
$function$
;

grant delete on table "public"."project_members" to "authenticated";

grant insert on table "public"."project_members" to "authenticated";

grant references on table "public"."project_members" to "authenticated";

grant select on table "public"."project_members" to "authenticated";

grant trigger on table "public"."project_members" to "authenticated";

grant truncate on table "public"."project_members" to "authenticated";

grant update on table "public"."project_members" to "authenticated";

grant delete on table "public"."project_members" to "service_role";

grant insert on table "public"."project_members" to "service_role";

grant references on table "public"."project_members" to "service_role";

grant select on table "public"."project_members" to "service_role";

grant trigger on table "public"."project_members" to "service_role";

grant truncate on table "public"."project_members" to "service_role";

grant update on table "public"."project_members" to "service_role";

grant delete on table "public"."projects" to "authenticated";

grant insert on table "public"."projects" to "authenticated";

grant references on table "public"."projects" to "authenticated";

grant select on table "public"."projects" to "authenticated";

grant trigger on table "public"."projects" to "authenticated";

grant truncate on table "public"."projects" to "authenticated";

grant update on table "public"."projects" to "authenticated";

grant delete on table "public"."projects" to "service_role";

grant insert on table "public"."projects" to "service_role";

grant references on table "public"."projects" to "service_role";

grant select on table "public"."projects" to "service_role";

grant trigger on table "public"."projects" to "service_role";

grant truncate on table "public"."projects" to "service_role";

grant update on table "public"."projects" to "service_role";

grant delete on table "public"."task_lists" to "authenticated";

grant insert on table "public"."task_lists" to "authenticated";

grant references on table "public"."task_lists" to "authenticated";

grant select on table "public"."task_lists" to "authenticated";

grant trigger on table "public"."task_lists" to "authenticated";

grant truncate on table "public"."task_lists" to "authenticated";

grant update on table "public"."task_lists" to "authenticated";

grant delete on table "public"."task_lists" to "service_role";

grant insert on table "public"."task_lists" to "service_role";

grant references on table "public"."task_lists" to "service_role";

grant select on table "public"."task_lists" to "service_role";

grant trigger on table "public"."task_lists" to "service_role";

grant truncate on table "public"."task_lists" to "service_role";

grant update on table "public"."task_lists" to "service_role";

grant delete on table "public"."tasks" to "authenticated";

grant insert on table "public"."tasks" to "authenticated";

grant references on table "public"."tasks" to "authenticated";

grant select on table "public"."tasks" to "authenticated";

grant trigger on table "public"."tasks" to "authenticated";

grant truncate on table "public"."tasks" to "authenticated";

grant update on table "public"."tasks" to "authenticated";

grant delete on table "public"."tasks" to "service_role";

grant insert on table "public"."tasks" to "service_role";

grant references on table "public"."tasks" to "service_role";

grant select on table "public"."tasks" to "service_role";

grant trigger on table "public"."tasks" to "service_role";

grant truncate on table "public"."tasks" to "service_role";

grant update on table "public"."tasks" to "service_role";


  create policy "Admins/owners can add project members"
  on "public"."project_members"
  as permissive
  for insert
  to public
with check (public.is_project_manager(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Admins/owners can remove project members"
  on "public"."project_members"
  as permissive
  for delete
  to public
using (public.is_project_manager(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Users with project access can see project members"
  on "public"."project_members"
  as permissive
  for select
  to public
using (public.can_access_project(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Members can see accessible projects"
  on "public"."projects"
  as permissive
  for select
  to public
using (public.can_access_project(id, ( SELECT auth.uid() AS uid)));



  create policy "Non-guest members can create projects"
  on "public"."projects"
  as permissive
  for insert
  to public
with check (((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role, 'member'::public.workspace_role])) AND (created_by = ( SELECT auth.uid() AS uid))));



  create policy "Non-guest members can delete accessible projects"
  on "public"."projects"
  as permissive
  for delete
  to public
using (public.can_edit_project(id, ( SELECT auth.uid() AS uid)));



  create policy "Non-guest members can update accessible projects"
  on "public"."projects"
  as permissive
  for update
  to public
using (public.can_edit_project(id, ( SELECT auth.uid() AS uid)));



  create policy "Non-guest members can create task lists"
  on "public"."task_lists"
  as permissive
  for insert
  to public
with check (public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Non-guest members can delete task lists"
  on "public"."task_lists"
  as permissive
  for delete
  to public
using (public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Non-guest members can update task lists"
  on "public"."task_lists"
  as permissive
  for update
  to public
using (public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Users with project access can see task lists"
  on "public"."task_lists"
  as permissive
  for select
  to public
using (public.can_access_project(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Non-guest members can create tasks"
  on "public"."tasks"
  as permissive
  for insert
  to public
with check ((public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)) AND (created_by = ( SELECT auth.uid() AS uid))));



  create policy "Non-guest members can delete tasks"
  on "public"."tasks"
  as permissive
  for delete
  to public
using (public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Non-guest members can update tasks"
  on "public"."tasks"
  as permissive
  for update
  to public
using (public.can_edit_project(project_id, ( SELECT auth.uid() AS uid)));



  create policy "Users with project access can see tasks"
  on "public"."tasks"
  as permissive
  for select
  to public
using (public.can_access_project(project_id, ( SELECT auth.uid() AS uid)));


CREATE TRIGGER on_project_created AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.add_default_task_list();

CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_task_lists_updated_at BEFORE UPDATE ON public.task_lists FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();



alter publication supabase_realtime add table public.tasks;

alter publication supabase_realtime add table public.task_lists;
