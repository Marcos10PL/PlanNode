-- Backfill NULLs so SET NOT NULL cannot fail on existing data
update public.notifications set metadata = '{}'::jsonb where metadata is null;
update public.profiles set role = 'user' where role is null;
update public.workspace_invitations set role = 'member' where role is null;
update public.workspace_invitations set status = 'pending' where status is null;
update public.profiles set created_at = now() where created_at is null;
update public.profiles set updated_at = created_at where updated_at is null;
update public.workspaces set created_at = now() where created_at is null;
update public.workspaces set updated_at = created_at where updated_at is null;
update public.workspace_members set created_at = now() where created_at is null;
update public.workspace_members set updated_at = created_at where updated_at is null;
update public.workspace_invitations set created_at = now() where created_at is null;
update public.projects set created_at = now() where created_at is null;
update public.projects set updated_at = created_at where updated_at is null;
update public.project_members set created_at = now() where created_at is null;
update public.task_lists set created_at = now() where created_at is null;
update public.task_lists set updated_at = created_at where updated_at is null;
update public.tasks set created_at = now() where created_at is null;
update public.tasks set updated_at = created_at where updated_at is null;
update public.workspace_members set joined_at = created_at where joined_at is null;

alter table "public"."notifications" alter column "metadata" set default '{}'::jsonb;
alter table "public"."notifications" alter column "metadata" set not null;
alter table "public"."profiles" alter column "created_at" set not null;
alter table "public"."profiles" alter column "role" set not null;
alter table "public"."profiles" alter column "updated_at" set not null;
alter table "public"."project_members" alter column "created_at" set not null;
alter table "public"."projects" alter column "created_at" set not null;
alter table "public"."projects" alter column "updated_at" set not null;
alter table "public"."task_lists" alter column "created_at" set not null;
alter table "public"."task_lists" alter column "updated_at" set not null;
alter table "public"."tasks" alter column "created_at" set not null;
alter table "public"."tasks" alter column "updated_at" set not null;
alter table "public"."workspace_invitations" alter column "created_at" set not null;
alter table "public"."workspace_invitations" alter column "role" set not null;
alter table "public"."workspace_invitations" alter column "status" set not null;
alter table "public"."workspace_members" alter column "created_at" set not null;
alter table "public"."workspace_members" alter column "joined_at" set not null;
alter table "public"."workspace_members" alter column "updated_at" set not null;
alter table "public"."workspaces" alter column "created_at" set not null;
alter table "public"."workspaces" alter column "updated_at" set not null;
alter table "public"."workspace_members" drop column "invited_at";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type public.notification_type, p_metadata jsonb DEFAULT '{}'::jsonb, p_link text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  INSERT INTO public.notifications (user_id, type, metadata, link)
  SELECT p_user_id, p_type, p_metadata, p_link
  WHERE (
    auth.uid() = p_user_id
    OR EXISTS (
      SELECT 1 FROM public.workspace_members caller
      JOIN public.workspace_members target ON target.workspace_id = caller.workspace_id
      WHERE caller.id = auth.uid() AND target.id = p_user_id
    )
    OR (
      p_type = 'workspace_invitation'
      AND EXISTS (
        SELECT 1 FROM public.workspace_invitations wi
        JOIN public.profiles p ON p.email = wi.email
        WHERE p.id = p_user_id
          AND wi.id = (p_metadata->>'invitationId')::uuid
          AND public.get_workspace_member_role(wi.workspace_id, auth.uid()) IN ('owner', 'admin')
      )
    )
  )
  AND COALESCE(
    (SELECT in_app_enabled FROM public.notification_preferences
     WHERE user_id = p_user_id AND type = p_type),
    true
  );
$function$
;
