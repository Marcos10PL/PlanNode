revoke references on table "public"."task_comments" from "anon";

revoke trigger on table "public"."task_comments" from "anon";

revoke truncate on table "public"."task_comments" from "anon";

ALTER TABLE public.task_comments REPLICA IDENTITY FULL;


