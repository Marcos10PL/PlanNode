create type "public"."invitation_status" as enum ('pending', 'accepted', 'declined');

create type "public"."user_role" as enum ('admin', 'user');

create type "public"."workspace_role" as enum ('owner', 'admin', 'member', 'guest');


  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text not null,
    "role" public.user_role default 'user'::public.user_role,
    "email" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."workspace_invitations" (
    "id" uuid not null default gen_random_uuid(),
    "workspace_id" uuid not null,
    "email" text not null,
    "role" public.workspace_role default 'member'::public.workspace_role,
    "status" public.invitation_status default 'pending'::public.invitation_status,
    "invited_by_id" uuid,
    "token" text not null,
    "expires_at" timestamp with time zone not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."workspace_invitations" enable row level security;


  create table "public"."workspace_members" (
    "id" uuid not null,
    "workspace_id" uuid not null,
    "role" public.workspace_role not null default 'member'::public.workspace_role,
    "invited_by_id" uuid,
    "joined_at" timestamp with time zone,
    "invited_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."workspace_members" enable row level security;


  create table "public"."workspaces" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid not null,
    "name" text not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."workspaces" enable row level security;

CREATE INDEX idx_workspace_invitations_email ON public.workspace_invitations USING btree (email);

CREATE INDEX idx_workspace_invitations_token ON public.workspace_invitations USING btree (token);

CREATE INDEX idx_workspace_invitations_workspace_id ON public.workspace_invitations USING btree (workspace_id);

CREATE INDEX idx_workspace_members_id ON public.workspace_members USING btree (id);

CREATE INDEX idx_workspace_members_workspace_id ON public.workspace_members USING btree (workspace_id);

CREATE INDEX idx_workspaces_owner_id ON public.workspaces USING btree (owner_id);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX workspace_invitations_pkey ON public.workspace_invitations USING btree (id);

CREATE UNIQUE INDEX workspace_invitations_token_key ON public.workspace_invitations USING btree (token);

CREATE UNIQUE INDEX workspace_invitations_workspace_id_email_key ON public.workspace_invitations USING btree (workspace_id, email);

CREATE UNIQUE INDEX workspace_members_pkey ON public.workspace_members USING btree (workspace_id, id);

CREATE UNIQUE INDEX workspaces_pkey ON public.workspaces USING btree (id);

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_pkey" PRIMARY KEY using index "workspace_invitations_pkey";

alter table "public"."workspace_members" add constraint "workspace_members_pkey" PRIMARY KEY using index "workspace_members_pkey";

alter table "public"."workspaces" add constraint "workspaces_pkey" PRIMARY KEY using index "workspaces_pkey";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_invited_by_id_fkey" FOREIGN KEY (invited_by_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."workspace_invitations" validate constraint "workspace_invitations_invited_by_id_fkey";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_token_key" UNIQUE using index "workspace_invitations_token_key";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_workspace_id_email_key" UNIQUE using index "workspace_invitations_workspace_id_email_key";

alter table "public"."workspace_invitations" add constraint "workspace_invitations_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_invitations" validate constraint "workspace_invitations_workspace_id_fkey";

alter table "public"."workspace_members" add constraint "workspace_members_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_members" validate constraint "workspace_members_id_fkey";

alter table "public"."workspace_members" add constraint "workspace_members_invited_by_id_fkey" FOREIGN KEY (invited_by_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."workspace_members" validate constraint "workspace_members_invited_by_id_fkey";

alter table "public"."workspace_members" add constraint "workspace_members_workspace_id_fkey" FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE not valid;

alter table "public"."workspace_members" validate constraint "workspace_members_workspace_id_fkey";

alter table "public"."workspaces" add constraint "workspaces_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."workspaces" validate constraint "workspaces_owner_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.add_workspace_owner()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, id, role, invited_by_id, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id, NOW());
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_workspace_member_role(p_workspace_id uuid, p_user_id uuid)
 RETURNS public.workspace_role
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT role FROM public.workspace_members
  WHERE workspace_id = p_workspace_id
  AND id = p_user_id
  LIMIT 1;
$function$
;

CREATE OR REPLACE FUNCTION public.get_workspace_owner(p_workspace_id uuid)
 RETURNS uuid
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT owner_id FROM public.workspaces WHERE id = p_workspace_id;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_user_email_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.profiles
    SET email = NEW.email
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.is_workspace_member(p_workspace_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
    AND id = p_user_id
  );
$function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  new.updated_at = now();
  return new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.set_workspaces_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."workspace_invitations" to "anon";

grant insert on table "public"."workspace_invitations" to "anon";

grant references on table "public"."workspace_invitations" to "anon";

grant trigger on table "public"."workspace_invitations" to "anon";

grant truncate on table "public"."workspace_invitations" to "anon";

grant update on table "public"."workspace_invitations" to "anon";

grant delete on table "public"."workspace_invitations" to "authenticated";

grant insert on table "public"."workspace_invitations" to "authenticated";

grant references on table "public"."workspace_invitations" to "authenticated";

grant select on table "public"."workspace_invitations" to "authenticated";

grant trigger on table "public"."workspace_invitations" to "authenticated";

grant truncate on table "public"."workspace_invitations" to "authenticated";

grant update on table "public"."workspace_invitations" to "authenticated";

grant delete on table "public"."workspace_invitations" to "service_role";

grant insert on table "public"."workspace_invitations" to "service_role";

grant references on table "public"."workspace_invitations" to "service_role";

grant select on table "public"."workspace_invitations" to "service_role";

grant trigger on table "public"."workspace_invitations" to "service_role";

grant truncate on table "public"."workspace_invitations" to "service_role";

grant update on table "public"."workspace_invitations" to "service_role";

grant delete on table "public"."workspace_members" to "anon";

grant insert on table "public"."workspace_members" to "anon";

grant references on table "public"."workspace_members" to "anon";

grant trigger on table "public"."workspace_members" to "anon";

grant truncate on table "public"."workspace_members" to "anon";

grant update on table "public"."workspace_members" to "anon";

grant delete on table "public"."workspace_members" to "authenticated";

grant insert on table "public"."workspace_members" to "authenticated";

grant references on table "public"."workspace_members" to "authenticated";

grant select on table "public"."workspace_members" to "authenticated";

grant trigger on table "public"."workspace_members" to "authenticated";

grant truncate on table "public"."workspace_members" to "authenticated";

grant update on table "public"."workspace_members" to "authenticated";

grant delete on table "public"."workspace_members" to "service_role";

grant insert on table "public"."workspace_members" to "service_role";

grant references on table "public"."workspace_members" to "service_role";

grant select on table "public"."workspace_members" to "service_role";

grant trigger on table "public"."workspace_members" to "service_role";

grant truncate on table "public"."workspace_members" to "service_role";

grant update on table "public"."workspace_members" to "service_role";

grant delete on table "public"."workspaces" to "anon";

grant insert on table "public"."workspaces" to "anon";

grant references on table "public"."workspaces" to "anon";

grant trigger on table "public"."workspaces" to "anon";

grant truncate on table "public"."workspaces" to "anon";

grant update on table "public"."workspaces" to "anon";

grant delete on table "public"."workspaces" to "authenticated";

grant insert on table "public"."workspaces" to "authenticated";

grant references on table "public"."workspaces" to "authenticated";

grant select on table "public"."workspaces" to "authenticated";

grant trigger on table "public"."workspaces" to "authenticated";

grant truncate on table "public"."workspaces" to "authenticated";

grant update on table "public"."workspaces" to "authenticated";

grant delete on table "public"."workspaces" to "service_role";

grant insert on table "public"."workspaces" to "service_role";

grant references on table "public"."workspaces" to "service_role";

grant select on table "public"."workspaces" to "service_role";

grant trigger on table "public"."workspaces" to "service_role";

grant truncate on table "public"."workspaces" to "service_role";

grant update on table "public"."workspaces" to "service_role";


  create policy "Admins can delete profiles."
  on "public"."profiles"
  as permissive
  for delete
  to public
using (public.is_admin());



  create policy "Users can insert their own profile."
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((((( SELECT auth.uid() AS uid) = id) AND (role = 'user'::public.user_role)) OR public.is_admin()));



  create policy "Users can select own profile."
  on "public"."profiles"
  as permissive
  for select
  to public
using (((( SELECT auth.uid() AS uid) = id) OR public.is_admin()));



  create policy "Users can update own profile."
  on "public"."profiles"
  as permissive
  for update
  to public
using ((((( SELECT auth.uid() AS uid) = id) AND (role = 'user'::public.user_role)) OR public.is_admin()));



  create policy "Admins/owners can create invitations"
  on "public"."workspace_invitations"
  as permissive
  for insert
  to public
with check ((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])));



  create policy "Admins/owners can see invitations"
  on "public"."workspace_invitations"
  as permissive
  for select
  to public
using (((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])) OR (email = ( SELECT profiles.email
   FROM public.profiles
  WHERE (profiles.id = ( SELECT auth.uid() AS uid))))));



  create policy "Admins/owners can add members"
  on "public"."workspace_members"
  as permissive
  for insert
  to public
with check ((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])));



  create policy "Admins/owners can remove members"
  on "public"."workspace_members"
  as permissive
  for delete
  to public
using ((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])));



  create policy "Admins/owners can update members"
  on "public"."workspace_members"
  as permissive
  for update
  to public
using ((public.get_workspace_member_role(workspace_id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])));



  create policy "Members can see other members in same workspace"
  on "public"."workspace_members"
  as permissive
  for select
  to public
using (public.is_workspace_member(workspace_id, ( SELECT auth.uid() AS uid)));



  create policy "Only workspace owner can delete workspace"
  on "public"."workspaces"
  as permissive
  for delete
  to public
using ((owner_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can create workspaces"
  on "public"."workspaces"
  as permissive
  for insert
  to public
with check ((owner_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can see workspaces they are members of"
  on "public"."workspaces"
  as permissive
  for select
  to public
using ((public.is_workspace_member(id, ( SELECT auth.uid() AS uid)) OR (owner_id = ( SELECT auth.uid() AS uid))));



  create policy "Workspace owners/admins can update workspace"
  on "public"."workspaces"
  as permissive
  for update
  to public
using ((public.get_workspace_member_role(id, ( SELECT auth.uid() AS uid)) = ANY (ARRAY['owner'::public.workspace_role, 'admin'::public.workspace_role])));


CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_workspace_members_updated_at BEFORE UPDATE ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.set_workspaces_updated_at();

CREATE TRIGGER on_workspace_created AFTER INSERT ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.add_workspace_owner();

CREATE TRIGGER set_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.set_workspaces_updated_at();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_email_updated AFTER UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_update();

REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.workspaces FROM anon;
REVOKE SELECT ON public.workspace_members FROM anon;
REVOKE SELECT ON public.workspace_invitations FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_workspace_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_workspace_member_role(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_workspace_owner(uuid) FROM anon;

