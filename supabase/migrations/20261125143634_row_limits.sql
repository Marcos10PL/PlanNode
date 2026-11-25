set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.enforce_row_limit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_scope uuid := (to_jsonb(NEW) ->> TG_ARGV[0])::uuid;
  v_limit integer := COALESCE(
    (SELECT (value #>> '{}')::integer FROM public.app_config WHERE key = TG_ARGV[1]),
    TG_ARGV[2]::integer
  );
  v_count integer;
BEGIN
  EXECUTE format(
    'SELECT count(*) FROM (SELECT 1 FROM %I.%I WHERE %I = $1 AND (%s) LIMIT $2) s',
    TG_TABLE_SCHEMA, TG_TABLE_NAME, TG_ARGV[0], COALESCE(TG_ARGV[4], 'true')
  ) INTO v_count USING v_scope, v_limit;

  IF v_count >= v_limit THEN
    RAISE EXCEPTION '%', TG_ARGV[3];
  END IF;

  RETURN NEW;
END;
$function$
;

REVOKE EXECUTE ON FUNCTION public.enforce_row_limit() FROM PUBLIC, anon;

CREATE TRIGGER enforce_workspaces_limit BEFORE INSERT ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.enforce_row_limit('owner_id', 'max_workspaces_per_user', '15', 'workspace_limit_reached');

CREATE TRIGGER enforce_workspace_members_limit BEFORE INSERT ON public.workspace_members FOR EACH ROW EXECUTE FUNCTION public.enforce_row_limit('workspace_id', 'max_members_per_workspace', '50', 'member_limit_reached');

CREATE TRIGGER enforce_pending_invitations_limit BEFORE INSERT ON public.workspace_invitations FOR EACH ROW EXECUTE FUNCTION public.enforce_row_limit('workspace_id', 'max_pending_invitations_per_workspace', '50', 'invitation_limit_reached', 'status = ''pending'' AND expires_at > now()');

CREATE TRIGGER enforce_projects_limit BEFORE INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.enforce_row_limit('workspace_id', 'max_projects_per_workspace', '50', 'project_limit_reached');

CREATE TRIGGER enforce_task_lists_limit BEFORE INSERT ON public.task_lists FOR EACH ROW EXECUTE FUNCTION public.enforce_row_limit('project_id', 'max_task_lists_per_project', '30', 'task_list_limit_reached');

CREATE TRIGGER enforce_tasks_limit BEFORE INSERT ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.enforce_row_limit('project_id', 'max_tasks_per_project', '1000', 'task_limit_reached');

CREATE TRIGGER enforce_task_comments_limit BEFORE INSERT ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.enforce_row_limit('task_id', 'max_comments_per_task', '500', 'comment_limit_reached');

INSERT INTO public.app_config (key, value) VALUES
  ('max_projects_per_workspace', '50'),
  ('max_task_lists_per_project', '30'),
  ('max_tasks_per_project', '1000'),
  ('max_members_per_workspace', '50'),
  ('max_pending_invitations_per_workspace', '50'),
  ('max_comments_per_task', '500')
ON CONFLICT (key) DO NOTHING;
