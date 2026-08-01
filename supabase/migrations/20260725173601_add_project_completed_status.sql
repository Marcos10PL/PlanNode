alter table "public"."projects" add column "is_completed" boolean not null default false;

CREATE INDEX idx_projects_workspace_completed_position ON public.projects USING btree (workspace_id, is_completed, "position");


