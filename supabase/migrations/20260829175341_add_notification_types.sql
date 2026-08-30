revoke delete on table "public"."project_favorites" from "anon";

revoke insert on table "public"."project_favorites" from "anon";

revoke select on table "public"."project_favorites" from "anon";

revoke update on table "public"."project_favorites" from "anon";

revoke delete on table "public"."project_members" from "anon";

revoke insert on table "public"."project_members" from "anon";

revoke select on table "public"."project_members" from "anon";

revoke update on table "public"."project_members" from "anon";

revoke delete on table "public"."projects" from "anon";

revoke insert on table "public"."projects" from "anon";

revoke select on table "public"."projects" from "anon";

revoke update on table "public"."projects" from "anon";

revoke delete on table "public"."task_comments" from "anon";

revoke insert on table "public"."task_comments" from "anon";

revoke select on table "public"."task_comments" from "anon";

revoke update on table "public"."task_comments" from "anon";

revoke delete on table "public"."task_events" from "anon";

revoke insert on table "public"."task_events" from "anon";

revoke select on table "public"."task_events" from "anon";

revoke update on table "public"."task_events" from "anon";

revoke delete on table "public"."task_lists" from "anon";

revoke insert on table "public"."task_lists" from "anon";

revoke select on table "public"."task_lists" from "anon";

revoke update on table "public"."task_lists" from "anon";

revoke delete on table "public"."tasks" from "anon";

revoke insert on table "public"."tasks" from "anon";

revoke select on table "public"."tasks" from "anon";

revoke update on table "public"."tasks" from "anon";

alter type "public"."notification_type" rename to "notification_type__old_version_to_be_dropped";

create type "public"."notification_type" as enum ('workspace_invitation', 'task_assigned', 'project_member_added', 'task_comment_added', 'workspace_role_changed');

alter table "public"."notifications" alter column type type "public"."notification_type" using type::text::"public"."notification_type";

drop function public.create_notification(uuid, "public"."notification_type__old_version_to_be_dropped", jsonb, text);

create function public.create_notification(
  p_user_id  uuid,
  p_type     public.notification_type,
  p_metadata jsonb    default null,
  p_link     text     default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, type, metadata, link)
  values (p_user_id, p_type, p_metadata, p_link);
$$;

grant execute on function public.create_notification(uuid, public.notification_type, jsonb, text) to authenticated;
revoke execute on function public.create_notification(uuid, public.notification_type, jsonb, text) from anon;

drop type "public"."notification_type__old_version_to_be_dropped";


