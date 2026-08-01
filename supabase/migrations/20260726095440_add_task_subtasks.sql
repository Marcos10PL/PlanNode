alter table "public"."tasks" add column "parent_task_id" uuid;

CREATE INDEX idx_tasks_parent_task_id ON public.tasks USING btree (parent_task_id);

alter table "public"."tasks" add constraint "tasks_parent_task_id_fkey" FOREIGN KEY (parent_task_id) REFERENCES public.tasks(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_parent_task_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.validate_subtask_parent()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  parent_task public.tasks%ROWTYPE;
BEGIN
  IF NEW.parent_task_id IS NOT NULL THEN
    SELECT * INTO parent_task FROM public.tasks WHERE id = NEW.parent_task_id;

    IF parent_task.parent_task_id IS NOT NULL THEN
      RAISE EXCEPTION 'Subtasks cannot have their own subtasks';
    END IF;

    IF parent_task.list_id != NEW.list_id OR parent_task.project_id != NEW.project_id THEN
      RAISE EXCEPTION 'Subtask must belong to the same list and project as its parent';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$
;

CREATE TRIGGER validate_subtask_parent_trigger BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.validate_subtask_parent();


