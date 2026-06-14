revoke delete on table "public"."app_config" from "anon";

revoke insert on table "public"."app_config" from "anon";

revoke references on table "public"."app_config" from "anon";

revoke select on table "public"."app_config" from "anon";

revoke trigger on table "public"."app_config" from "anon";

revoke truncate on table "public"."app_config" from "anon";

revoke update on table "public"."app_config" from "anon";

revoke delete on table "public"."app_config" from "authenticated";

revoke insert on table "public"."app_config" from "authenticated";

revoke update on table "public"."app_config" from "authenticated";

revoke delete on table "public"."email_templates" from "anon";

revoke insert on table "public"."email_templates" from "anon";

revoke references on table "public"."email_templates" from "anon";

revoke select on table "public"."email_templates" from "anon";

revoke trigger on table "public"."email_templates" from "anon";

revoke truncate on table "public"."email_templates" from "anon";

revoke update on table "public"."email_templates" from "anon";

revoke delete on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "anon";

revoke references on table "public"."notifications" from "anon";

revoke select on table "public"."notifications" from "anon";

revoke trigger on table "public"."notifications" from "anon";

revoke truncate on table "public"."notifications" from "anon";

revoke update on table "public"."notifications" from "anon";

revoke insert on table "public"."notifications" from "authenticated";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."workspace_invitations" from "anon";

revoke insert on table "public"."workspace_invitations" from "anon";

revoke references on table "public"."workspace_invitations" from "anon";

revoke trigger on table "public"."workspace_invitations" from "anon";

revoke truncate on table "public"."workspace_invitations" from "anon";

revoke update on table "public"."workspace_invitations" from "anon";

revoke delete on table "public"."workspace_members" from "anon";

revoke insert on table "public"."workspace_members" from "anon";

revoke references on table "public"."workspace_members" from "anon";

revoke trigger on table "public"."workspace_members" from "anon";

revoke truncate on table "public"."workspace_members" from "anon";

revoke update on table "public"."workspace_members" from "anon";

revoke delete on table "public"."workspaces" from "anon";

revoke insert on table "public"."workspaces" from "anon";

revoke references on table "public"."workspaces" from "anon";

revoke trigger on table "public"."workspaces" from "anon";

revoke truncate on table "public"."workspaces" from "anon";

revoke update on table "public"."workspaces" from "anon";

CREATE INDEX idx_workspace_invitations_status ON public.workspace_invitations USING btree (status);

ALTER publication supabase_realtime
ADD TABLE public.notifications;


