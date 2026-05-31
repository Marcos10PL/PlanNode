create type "public"."notification_type" as enum ('workspace_invitation');

create sequence "public"."email_templates_id_seq";

alter table "public"."workspace_members" drop constraint "workspace_members_id_fkey";


  create table "public"."email_templates" (
    "id" integer not null default nextval('public.email_templates_id_seq'::regclass),
    "name" character varying(100) not null,
    "subject" text not null,
    "html" text not null,
    "variables" text[] not null default ARRAY[]::text[],
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."email_templates" enable row level security;


  create table "public"."notifications" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "type" public.notification_type not null,
    "title" text not null,
    "message" text,
    "link" text,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."notifications" enable row level security;

alter sequence "public"."email_templates_id_seq" owned by "public"."email_templates"."id";

CREATE UNIQUE INDEX email_templates_name_key ON public.email_templates USING btree (name);

CREATE UNIQUE INDEX email_templates_pkey ON public.email_templates USING btree (id);

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, read_at) WHERE (read_at IS NULL);

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);

CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id);

alter table "public"."email_templates" add constraint "email_templates_pkey" PRIMARY KEY using index "email_templates_pkey";

alter table "public"."notifications" add constraint "notifications_pkey" PRIMARY KEY using index "notifications_pkey";

alter table "public"."email_templates" add constraint "email_templates_name_key" UNIQUE using index "email_templates_name_key";

alter table "public"."notifications" add constraint "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."notifications" validate constraint "notifications_user_id_fkey";

alter table "public"."workspace_members" add constraint "workspace_members_id_fkey" FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_members" validate constraint "workspace_members_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_notification(p_user_id uuid, p_type public.notification_type, p_title text, p_message text DEFAULT NULL::text, p_link text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link);
$function$
;

grant delete on table "public"."email_templates" to "anon";

grant insert on table "public"."email_templates" to "anon";

grant references on table "public"."email_templates" to "anon";

grant select on table "public"."email_templates" to "anon";

grant trigger on table "public"."email_templates" to "anon";

grant truncate on table "public"."email_templates" to "anon";

grant update on table "public"."email_templates" to "anon";

grant delete on table "public"."email_templates" to "authenticated";

grant insert on table "public"."email_templates" to "authenticated";

grant references on table "public"."email_templates" to "authenticated";

grant select on table "public"."email_templates" to "authenticated";

grant trigger on table "public"."email_templates" to "authenticated";

grant truncate on table "public"."email_templates" to "authenticated";

grant update on table "public"."email_templates" to "authenticated";

grant delete on table "public"."email_templates" to "service_role";

grant insert on table "public"."email_templates" to "service_role";

grant references on table "public"."email_templates" to "service_role";

grant select on table "public"."email_templates" to "service_role";

grant trigger on table "public"."email_templates" to "service_role";

grant truncate on table "public"."email_templates" to "service_role";

grant update on table "public"."email_templates" to "service_role";

grant delete on table "public"."notifications" to "anon";

grant insert on table "public"."notifications" to "anon";

grant references on table "public"."notifications" to "anon";

grant select on table "public"."notifications" to "anon";

grant trigger on table "public"."notifications" to "anon";

grant truncate on table "public"."notifications" to "anon";

grant update on table "public"."notifications" to "anon";

grant delete on table "public"."notifications" to "authenticated";

grant insert on table "public"."notifications" to "authenticated";

grant references on table "public"."notifications" to "authenticated";

grant select on table "public"."notifications" to "authenticated";

grant trigger on table "public"."notifications" to "authenticated";

grant truncate on table "public"."notifications" to "authenticated";

grant update on table "public"."notifications" to "authenticated";

grant delete on table "public"."notifications" to "service_role";

grant insert on table "public"."notifications" to "service_role";

grant references on table "public"."notifications" to "service_role";

grant select on table "public"."notifications" to "service_role";

grant trigger on table "public"."notifications" to "service_role";

grant truncate on table "public"."notifications" to "service_role";

grant update on table "public"."notifications" to "service_role";


  create policy "admin can manage email_templates"
  on "public"."email_templates"
  as permissive
  for all
  to authenticated
using (public.is_admin())
with check (public.is_admin());



  create policy "authenticated can read email_templates"
  on "public"."email_templates"
  as permissive
  for select
  to authenticated
using (true);



  create policy "users can delete own notifications"
  on "public"."notifications"
  as permissive
  for delete
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "users can update own notifications"
  on "public"."notifications"
  as permissive
  for update
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "users see own notifications"
  on "public"."notifications"
  as permissive
  for select
  to authenticated
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Admins/owners can revoke invitations"
  on "public"."workspace_invitations"
  as permissive
  for delete
  to public
using ((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])));



  create policy "Invited users can update their invitation status"
  on "public"."workspace_invitations"
  as permissive
  for update
  to public
using ((email = ( SELECT profiles.email
   FROM public.profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))))
with check ((email = ( SELECT profiles.email
   FROM public.profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid)))));



  create policy "Invited users can join workspace"
  on "public"."workspace_members"
  as permissive
  for insert
  to public
with check (((id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM (public.workspace_invitations wi
     JOIN public.profiles p ON ((p.email = wi.email)))
  WHERE ((wi.workspace_id = workspace_members.workspace_id) AND (p.id = ( SELECT auth.uid() AS uid)) AND (wi.status = 'pending'::public.invitation_status) AND (wi.expires_at > now()))))));



  create policy "Members can leave workspace"
  on "public"."workspace_members"
  as permissive
  for delete
  to public
using (((id = ( SELECT auth.uid() AS uid)) AND (role <> 'owner'::public.workspace_role)));



