revoke references on table "public"."task_events" from "anon";

revoke trigger on table "public"."task_events" from "anon";

revoke truncate on table "public"."task_events" from "anon";


  create table "public"."task_comments" (
    "id" uuid not null default gen_random_uuid(),
    "task_id" uuid not null,
    "user_id" uuid,
    "content" text not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."task_comments" enable row level security;

CREATE INDEX idx_task_comments_task_created ON public.task_comments USING btree (task_id, created_at);

CREATE UNIQUE INDEX task_comments_pkey ON public.task_comments USING btree (id);

alter table "public"."task_comments" add constraint "task_comments_pkey" PRIMARY KEY using index "task_comments_pkey";

alter table "public"."task_comments" add constraint "task_comments_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE not valid;

alter table "public"."task_comments" validate constraint "task_comments_task_id_fkey";

alter table "public"."task_comments" add constraint "task_comments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."task_comments" validate constraint "task_comments_user_id_fkey";

grant delete on table "public"."task_comments" to "authenticated";

grant insert on table "public"."task_comments" to "authenticated";

grant references on table "public"."task_comments" to "authenticated";

grant select on table "public"."task_comments" to "authenticated";

grant trigger on table "public"."task_comments" to "authenticated";

grant truncate on table "public"."task_comments" to "authenticated";

grant update on table "public"."task_comments" to "authenticated";

grant delete on table "public"."task_comments" to "service_role";

grant insert on table "public"."task_comments" to "service_role";

grant references on table "public"."task_comments" to "service_role";

grant select on table "public"."task_comments" to "service_role";

grant trigger on table "public"."task_comments" to "service_role";

grant truncate on table "public"."task_comments" to "service_role";

grant update on table "public"."task_comments" to "service_role";


  create policy "Authors and project managers can delete task comments"
  on "public"."task_comments"
  as permissive
  for delete
  to public
using (((user_id = ( SELECT auth.uid() AS uid)) OR (EXISTS ( SELECT 1
   FROM public.tasks t
  WHERE ((t.id = task_comments.task_id) AND public.is_project_manager(t.project_id, ( SELECT auth.uid() AS uid)))))));



  create policy "Authors can update their own task comments"
  on "public"."task_comments"
  as permissive
  for update
  to public
using ((user_id = ( SELECT auth.uid() AS uid)))
with check ((user_id = ( SELECT auth.uid() AS uid)));



  create policy "Non-guest members can create task comments"
  on "public"."task_comments"
  as permissive
  for insert
  to public
with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.tasks t
  WHERE ((t.id = task_comments.task_id) AND public.can_edit_project(t.project_id, ( SELECT auth.uid() AS uid)))))));



  create policy "Users with project access can see task comments"
  on "public"."task_comments"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.tasks t
  WHERE ((t.id = task_comments.task_id) AND public.can_access_project(t.project_id, ( SELECT auth.uid() AS uid))))));


CREATE TRIGGER set_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.task_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;


