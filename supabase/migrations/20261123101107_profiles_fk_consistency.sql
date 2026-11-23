alter table "public"."notification_preferences" drop constraint "notification_preferences_user_id_fkey";

alter table "public"."notifications" drop constraint "notifications_user_id_fkey";

alter table "public"."project_favorites" drop constraint "project_favorites_user_id_fkey";

alter table "public"."project_members" drop constraint "project_members_added_by_id_fkey";

alter table "public"."projects" drop constraint "projects_created_by_fkey";

alter table "public"."task_lists" drop constraint "task_lists_created_by_fkey";

alter table "public"."tasks" drop constraint "tasks_created_by_fkey";

alter table "public"."workspace_invitations" drop constraint "workspace_invitations_invited_by_id_fkey";

alter table "public"."workspace_members" drop constraint "workspace_members_invited_by_id_fkey";

alter table "public"."workspaces" drop constraint "workspaces_owner_id_fkey";

alter table "public"."notification_preferences" add constraint "notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notification_preferences" validate constraint "notification_preferences_user_id_fkey";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."project_favorites" add constraint "project_favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."project_favorites" validate constraint "project_favorites_user_id_fkey";

alter table "public"."project_members" add constraint "project_members_added_by_id_fkey" FOREIGN KEY (added_by_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."project_members" validate constraint "project_members_added_by_id_fkey";

alter table "public"."projects" add constraint "projects_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."projects" validate constraint "projects_created_by_fkey";

alter table "public"."task_lists" add constraint "task_lists_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."task_lists" validate constraint "task_lists_created_by_fkey";

alter table "public"."tasks" add constraint "tasks_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_created_by_fkey";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_invited_by_id_fkey" FOREIGN KEY (invited_by_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."workspace_invitations" validate constraint "workspace_invitations_invited_by_id_fkey";

alter table "public"."workspace_members" add constraint "workspace_members_invited_by_id_fkey" FOREIGN KEY (invited_by_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."workspace_members" validate constraint "workspace_members_invited_by_id_fkey";

alter table "public"."workspaces" add constraint "workspaces_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."workspaces" validate constraint "workspaces_owner_id_fkey";
