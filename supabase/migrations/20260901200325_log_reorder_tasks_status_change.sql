set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.reorder_tasks(p_list_id uuid, p_changes jsonb)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  WITH changes AS (
    SELECT * FROM jsonb_to_recordset(p_changes) AS c(id uuid, position integer, status public.task_status)
  ),
  before AS (
    SELECT t.id, t.status AS old_status
    FROM public.tasks t
    JOIN changes c ON c.id = t.id
    WHERE t.list_id = p_list_id
  ),
  updated AS (
    UPDATE public.tasks t
    SET position = c.position,
        status = COALESCE(c.status, t.status)
    FROM changes c
    WHERE t.id = c.id
      AND t.list_id = p_list_id
    RETURNING t.id, t.status AS new_status
  ),
  logged AS (
    INSERT INTO public.task_events (task_id, user_id, type, metadata)
    SELECT u.id, auth.uid(), 'status_changed',
           jsonb_build_object('from', b.old_status, 'to', u.new_status)
    FROM updated u
    JOIN before b ON b.id = u.id
    WHERE b.old_status IS DISTINCT FROM u.new_status
    RETURNING 1
  )
  SELECT count(*) FROM logged;
$function$
;


