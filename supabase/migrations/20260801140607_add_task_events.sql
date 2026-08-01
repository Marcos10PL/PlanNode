
  create table "public"."task_events" (
    "id" uuid not null default gen_random_uuid(),
    "task_id" uuid not null,
    "user_id" uuid,
    "type" text not null,
    "metadata" jsonb not null default '{}'::jsonb,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."task_events" enable row level security;

CREATE INDEX idx_task_events_task_created ON public.task_events USING btree (task_id, created_at);

CREATE UNIQUE INDEX task_events_pkey ON public.task_events USING btree (id);

alter table "public"."task_events" add constraint "task_events_pkey" PRIMARY KEY using index "task_events_pkey";

alter table "public"."task_events" add constraint "task_events_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE not valid;

alter table "public"."task_events" validate constraint "task_events_task_id_fkey";

alter table "public"."task_events" add constraint "task_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL not valid;

alter table "public"."task_events" validate constraint "task_events_user_id_fkey";

grant insert on table "public"."task_events" to "authenticated";

grant references on table "public"."task_events" to "authenticated";

grant select on table "public"."task_events" to "authenticated";

grant trigger on table "public"."task_events" to "authenticated";

grant truncate on table "public"."task_events" to "authenticated";

grant delete on table "public"."task_events" to "service_role";

grant insert on table "public"."task_events" to "service_role";

grant references on table "public"."task_events" to "service_role";

grant select on table "public"."task_events" to "service_role";

grant trigger on table "public"."task_events" to "service_role";

grant truncate on table "public"."task_events" to "service_role";

grant update on table "public"."task_events" to "service_role";


  create policy "Non-guest members can create task events"
  on "public"."task_events"
  as permissive
  for insert
  to public
with check (((user_id = ( SELECT auth.uid() AS uid)) AND (EXISTS ( SELECT 1
   FROM public.tasks t
  WHERE ((t.id = task_events.task_id) AND public.can_edit_project(t.project_id, ( SELECT auth.uid() AS uid)))))));



  create policy "Users with project access can see task events"
  on "public"."task_events"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.tasks t
  WHERE ((t.id = task_events.task_id) AND public.can_access_project(t.project_id, ( SELECT auth.uid() AS uid))))));



