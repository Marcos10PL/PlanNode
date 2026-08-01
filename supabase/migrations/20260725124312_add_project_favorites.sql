
  create table "public"."project_favorites" (
    "user_id" uuid not null,
    "project_id" uuid not null
      );


alter table "public"."project_favorites" enable row level security;

CREATE UNIQUE INDEX project_favorites_pkey ON public.project_favorites USING btree (user_id, project_id);

alter table "public"."project_favorites" add constraint "project_favorites_pkey" PRIMARY KEY using index "project_favorites_pkey";

alter table "public"."project_favorites" add constraint "project_favorites_project_id_fkey" FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE not valid;

alter table "public"."project_favorites" validate constraint "project_favorites_project_id_fkey";

alter table "public"."project_favorites" add constraint "project_favorites_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."project_favorites" validate constraint "project_favorites_user_id_fkey";

grant delete on table "public"."project_favorites" to "authenticated";

grant insert on table "public"."project_favorites" to "authenticated";

grant references on table "public"."project_favorites" to "authenticated";

grant select on table "public"."project_favorites" to "authenticated";

grant trigger on table "public"."project_favorites" to "authenticated";

grant truncate on table "public"."project_favorites" to "authenticated";

grant delete on table "public"."project_favorites" to "service_role";

grant insert on table "public"."project_favorites" to "service_role";

grant references on table "public"."project_favorites" to "service_role";

grant select on table "public"."project_favorites" to "service_role";

grant trigger on table "public"."project_favorites" to "service_role";

grant truncate on table "public"."project_favorites" to "service_role";

grant update on table "public"."project_favorites" to "service_role";


  create policy "Users can favorite accessible projects"
  on "public"."project_favorites"
  as permissive
  for insert
  to public
with check (((user_id = ( SELECT auth.uid() AS uid)) AND public.can_access_project(project_id, ( SELECT auth.uid() AS uid))));



  create policy "Users can remove their own favorites"
  on "public"."project_favorites"
  as permissive
  for delete
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Users can see their own favorites"
  on "public"."project_favorites"
  as permissive
  for select
  to public
using ((user_id = ( SELECT auth.uid() AS uid)));



