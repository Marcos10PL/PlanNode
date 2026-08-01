alter table "public"."projects" add column "position" integer not null default 0;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY workspace_id ORDER BY created_at ASC
  ) - 1 AS new_position
  FROM public.projects
)
UPDATE public.projects p
SET position = ordered.new_position
FROM ordered
WHERE p.id = ordered.id;

CREATE INDEX idx_projects_workspace_position ON public.projects USING btree (workspace_id, "position");


