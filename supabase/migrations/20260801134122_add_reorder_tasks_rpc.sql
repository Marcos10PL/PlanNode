set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.reorder_tasks(p_list_id uuid, p_changes jsonb)
 RETURNS void
 LANGUAGE sql
 SET search_path TO ''
AS $function$
  UPDATE public.tasks t
  SET position = c.position,
      status = COALESCE(c.status, t.status)
  FROM jsonb_to_recordset(p_changes) AS c(id uuid, position integer, status public.task_status)
  WHERE t.id = c.id
    AND t.list_id = p_list_id;
$function$
;


