revoke references on table "public"."project_favorites" from "anon";

revoke trigger on table "public"."project_favorites" from "anon";

revoke truncate on table "public"."project_favorites" from "anon";

alter table "public"."project_favorites" add column "position" integer not null default 0;

CREATE INDEX idx_project_favorites_user_position ON public.project_favorites USING btree (user_id, "position");

grant update on table "public"."project_favorites" to "authenticated";


  create policy "Users can reorder their own favorites"
  on "public"."project_favorites"
  as permissive
  for update
  to public
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));