-- Types
CREATE TYPE public.task_status AS ENUM ('on_hold', 'todo', 'in_progress', 'in_review', 'in_tests', 'done', 'cancelled');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Tables
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_private boolean NOT NULL DEFAULT false,
  is_completed boolean NOT NULL DEFAULT false,
  icon text NOT NULL DEFAULT 'folder-kanban',
  color text NOT NULL DEFAULT 'neutral',
  position integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.project_members (
  id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  added_by_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),

  PRIMARY KEY (project_id, id)
);

CREATE TABLE public.project_favorites (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,

  PRIMARY KEY (user_id, project_id)
);

CREATE TABLE public.task_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE (id, project_id)
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  list_id uuid NOT NULL,
  parent_task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status public.task_status NOT NULL DEFAULT 'todo',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  assignee_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date date,
  position integer NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  FOREIGN KEY (list_id, project_id) REFERENCES public.task_lists(id, project_id) ON DELETE CASCADE
);

CREATE TABLE public.task_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.can_access_project(p_project_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id
      AND public.is_workspace_member(p.workspace_id, p_user_id)
      AND (
        NOT p.is_private
        OR public.get_workspace_member_role(p.workspace_id, p_user_id) IN ('owner', 'admin')
        OR EXISTS (
          SELECT 1 FROM public.project_members pm
          WHERE pm.project_id = p.id AND pm.id = p_user_id
        )
      )
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.can_edit_project(p_project_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT public.can_access_project(p_project_id, p_user_id)
    AND public.get_workspace_member_role(
      (SELECT workspace_id FROM public.projects WHERE id = p_project_id),
      p_user_id
    ) IN ('owner', 'admin', 'member');
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_project_manager(p_project_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT public.get_workspace_member_role(
    (SELECT workspace_id FROM public.projects WHERE id = p_project_id),
    p_user_id
  ) IN ('owner', 'admin');
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_project_creator(p_project_id uuid, p_user_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = p_project_id AND p.created_by = p_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- Policies: projects
CREATE POLICY "Members can see accessible projects"
ON public.projects FOR SELECT
USING (
  public.is_workspace_member(workspace_id, (SELECT auth.uid()))
  AND (
    NOT is_private
    OR public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = projects.id AND pm.id = (SELECT auth.uid())
    )
  )
);

CREATE POLICY "Create projects, private ones require manager role"
ON public.projects FOR INSERT
WITH CHECK (
  created_by = (SELECT auth.uid())
  AND (
    (
      NOT is_private
      AND public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin', 'member')
    )
    OR (
      is_private
      AND public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin')
    )
  )
);

CREATE POLICY "Non-guest members can update accessible projects"
ON public.projects FOR UPDATE
USING (public.can_edit_project(id, (SELECT auth.uid())));

CREATE POLICY "Non-guest members can delete accessible projects"
ON public.projects FOR DELETE
USING (public.can_edit_project(id, (SELECT auth.uid())));

-- Policies: project_favorites
CREATE POLICY "Users can see their own favorites"
ON public.project_favorites FOR SELECT
USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can favorite accessible projects"
ON public.project_favorites FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND public.can_access_project(project_id, (SELECT auth.uid()))
);

CREATE POLICY "Users can reorder their own favorites"
ON public.project_favorites FOR UPDATE
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can remove their own favorites"
ON public.project_favorites FOR DELETE
USING (user_id = (SELECT auth.uid()));

-- Policies: project_members
CREATE POLICY "Users with project access can see project members"
ON public.project_members FOR SELECT
USING (public.can_access_project(project_id, (SELECT auth.uid())));

CREATE POLICY "Admins/owners or creators can add project members"
ON public.project_members FOR INSERT
WITH CHECK (
  public.is_project_manager(project_id, (SELECT auth.uid()))
  OR (
    id = (SELECT auth.uid())
    AND public.is_project_creator(project_id, (SELECT auth.uid()))
  )
);

CREATE POLICY "Admins/owners can remove project members"
ON public.project_members FOR DELETE
USING (public.is_project_manager(project_id, (SELECT auth.uid())));

-- Policies: task_lists
CREATE POLICY "Users with project access can see task lists"
ON public.task_lists FOR SELECT
USING (public.can_access_project(project_id, (SELECT auth.uid())));

CREATE POLICY "Non-guest members can create task lists"
ON public.task_lists FOR INSERT
WITH CHECK (public.can_edit_project(project_id, (SELECT auth.uid())));

CREATE POLICY "Non-guest members can update task lists"
ON public.task_lists FOR UPDATE
USING (public.can_edit_project(project_id, (SELECT auth.uid())));

CREATE POLICY "Non-guest members can delete task lists"
ON public.task_lists FOR DELETE
USING (public.can_edit_project(project_id, (SELECT auth.uid())));

-- Policies: tasks
CREATE POLICY "Users with project access can see tasks"
ON public.tasks FOR SELECT
USING (public.can_access_project(project_id, (SELECT auth.uid())));

CREATE POLICY "Non-guest members can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (
  public.can_edit_project(project_id, (SELECT auth.uid()))
  AND created_by = (SELECT auth.uid())
  AND (assignee_id IS NULL OR public.can_access_project(project_id, assignee_id))
);

CREATE POLICY "Non-guest members can update tasks"
ON public.tasks FOR UPDATE
USING (public.can_edit_project(project_id, (SELECT auth.uid())))
WITH CHECK (
  public.can_edit_project(project_id, (SELECT auth.uid()))
  AND (assignee_id IS NULL OR public.can_access_project(project_id, assignee_id))
);

CREATE POLICY "Non-guest members can delete tasks"
ON public.tasks FOR DELETE
USING (public.can_edit_project(project_id, (SELECT auth.uid())));

-- Policies: task_events
CREATE POLICY "Users with project access can see task events"
ON public.task_events FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_events.task_id
      AND public.can_access_project(t.project_id, (SELECT auth.uid()))
  )
);

CREATE POLICY "Non-guest members can create task events"
ON public.task_events FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_events.task_id
      AND public.can_edit_project(t.project_id, (SELECT auth.uid()))
  )
);

-- Policies: task_comments
CREATE POLICY "Users with project access can see task comments"
ON public.task_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_comments.task_id
      AND public.can_access_project(t.project_id, (SELECT auth.uid()))
  )
);

CREATE POLICY "Non-guest members can create task comments"
ON public.task_comments FOR INSERT
WITH CHECK (
  user_id = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_comments.task_id
      AND public.can_edit_project(t.project_id, (SELECT auth.uid()))
  )
);

CREATE POLICY "Authors can update their own task comments"
ON public.task_comments FOR UPDATE
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Authors and project managers can delete task comments"
ON public.task_comments FOR DELETE
USING (
  user_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_comments.task_id
      AND public.is_project_manager(t.project_id, (SELECT auth.uid()))
  )
);

-- RPC: bulk-update task positions (and optionally status) in a single UPDATE
CREATE OR REPLACE FUNCTION public.reorder_tasks(p_list_id uuid, p_changes jsonb)
RETURNS void AS $$
  UPDATE public.tasks t
  SET position = c.position,
      status = COALESCE(c.status, t.status)
  FROM jsonb_to_recordset(p_changes) AS c(id uuid, position integer, status public.task_status)
  WHERE t.id = c.id
    AND t.list_id = p_list_id;
$$ LANGUAGE sql SET search_path = '';

-- Trigger: subtasks are limited to one level of nesting and must stay
-- within the same list/project as their parent
CREATE OR REPLACE FUNCTION public.validate_subtask_parent()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER validate_subtask_parent_trigger
  BEFORE INSERT OR UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.validate_subtask_parent();

-- Creates a project, its default task list and the creator's project_members
-- row in a single transaction, so a project can never end up without a list.
CREATE OR REPLACE FUNCTION public.create_project_with_default_list(
  p_workspace_id uuid,
  p_name         text,
  p_description  text,
  p_is_private   boolean,
  p_icon         text,
  p_color        text,
  p_position     integer,
  p_list_name    text
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_project_id uuid;
BEGIN
  INSERT INTO public.projects (
    workspace_id, name, description, is_private, icon, color, position, created_by
  )
  VALUES (
    p_workspace_id, p_name, p_description, p_is_private, p_icon, p_color, p_position, auth.uid()
  )
  RETURNING id INTO v_project_id;

  -- inserted before task_lists: for a private project, can_access_project()
  -- (used by the task_lists INSERT policy) needs either a manager role or an
  -- existing project_members row — the creator's own row must exist first
  INSERT INTO public.project_members (project_id, id, added_by_id)
  VALUES (v_project_id, auth.uid(), auth.uid());

  INSERT INTO public.task_lists (project_id, name, position)
  VALUES (v_project_id, p_list_name, 0);

  RETURN v_project_id;
END;
$$;

-- Seeds a new user's first workspace with one onboarding project (list + 3 example tasks across statuses)
CREATE OR REPLACE FUNCTION public.create_onboarding_workspace(
  p_workspace_name      text,
  p_project_name        text,
  p_project_description text,
  p_list_name           text,
  p_task1_title         text,
  p_task1_description   text,
  p_task2_title         text,
  p_task2_description   text,
  p_task3_title         text
)
RETURNS TABLE (project_id uuid, list_id uuid)
LANGUAGE plpgsql
AS $$
DECLARE
  v_workspace_id uuid;
  v_project_id   uuid;
  v_list_id      uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM public.workspaces WHERE owner_id = auth.uid()) THEN
    RETURN;
  END IF;

  INSERT INTO public.workspaces (owner_id, name)
  VALUES (auth.uid(), p_workspace_name)
  RETURNING id INTO v_workspace_id;

  INSERT INTO public.projects (workspace_id, name, description, created_by)
  VALUES (v_workspace_id, p_project_name, p_project_description, auth.uid())
  RETURNING id INTO v_project_id;

  INSERT INTO public.project_members (project_id, id, added_by_id)
  VALUES (v_project_id, auth.uid(), auth.uid());

  INSERT INTO public.task_lists (project_id, name, position)
  VALUES (v_project_id, p_list_name, 0)
  RETURNING id INTO v_list_id;

  INSERT INTO public.tasks (project_id, list_id, title, description, status, position, created_by)
  VALUES
    (v_project_id, v_list_id, p_task1_title, p_task1_description, 'todo', 0, auth.uid()),
    (v_project_id, v_list_id, p_task2_title, p_task2_description, 'in_progress', 1, auth.uid()),
    (v_project_id, v_list_id, p_task3_title, NULL, 'done', 2, auth.uid());

  RETURN QUERY SELECT v_project_id, v_list_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.create_onboarding_workspace(
  text, text, text, text, text, text, text, text, text
) FROM anon;

-- Only workspace owners/admins may change an existing project's is_private
-- flag (symmetric with the INSERT policy above). Other fields on a project
-- a member can already edit stay editable — this only guards the one column.
CREATE OR REPLACE FUNCTION public.enforce_private_project_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_private IS DISTINCT FROM OLD.is_private THEN
    IF public.get_workspace_member_role(NEW.workspace_id, auth.uid()) NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Only workspace owners and admins can change a project''s privacy setting';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER enforce_private_project_change_trigger
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.enforce_private_project_change();

-- Triggers: update updated_at
CREATE OR REPLACE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE TRIGGER set_task_lists_updated_at
  BEFORE UPDATE ON public.task_lists
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE TRIGGER set_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

CREATE OR REPLACE TRIGGER set_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Triggers: clear assignee when project member is removed
CREATE OR REPLACE FUNCTION public.clear_assignee_on_project_member_removed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasks
  SET assignee_id = NULL
  WHERE project_id = OLD.project_id
    AND assignee_id = OLD.id
    AND NOT public.can_access_project(OLD.project_id, OLD.id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_project_member_removed
  AFTER DELETE ON public.project_members
  FOR EACH ROW EXECUTE PROCEDURE public.clear_assignee_on_project_member_removed();

CREATE OR REPLACE FUNCTION public.clear_assignee_on_workspace_member_removed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasks t
  SET assignee_id = NULL
  FROM public.projects p
  WHERE p.id = t.project_id
    AND p.workspace_id = OLD.workspace_id
    AND t.assignee_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_workspace_member_removed_clear_assignee
  AFTER DELETE ON public.workspace_members
  FOR EACH ROW EXECUTE PROCEDURE public.clear_assignee_on_workspace_member_removed();

-- Indexes
CREATE INDEX idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX idx_projects_workspace_position ON public.projects(workspace_id, position);
CREATE INDEX idx_projects_workspace_completed_position ON public.projects(workspace_id, is_completed, position);
CREATE INDEX idx_project_members_id ON public.project_members(id);
CREATE INDEX idx_project_favorites_user_position ON public.project_favorites(user_id, position);
CREATE INDEX idx_task_lists_project_id ON public.task_lists(project_id, position);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_parent_task_id ON public.tasks(parent_task_id);
CREATE INDEX idx_tasks_list_id ON public.tasks(list_id, position);
CREATE INDEX idx_tasks_assignee_due ON public.tasks(assignee_id, due_date);
CREATE INDEX idx_tasks_project_status ON public.tasks(project_id, status);
CREATE INDEX idx_task_events_task_created ON public.task_events(task_id, created_at);
CREATE INDEX idx_task_comments_task_created ON public.task_comments(task_id, created_at);

-- Permissions
REVOKE ALL ON public.projects FROM anon;
REVOKE ALL ON public.project_favorites FROM anon;
REVOKE ALL ON public.project_members FROM anon;
REVOKE ALL ON public.task_lists FROM anon;
REVOKE ALL ON public.tasks FROM anon;
REVOKE ALL ON public.task_events FROM anon;
REVOKE ALL ON public.task_comments FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_project(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_project(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_project_manager(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_project_creator(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.create_project_with_default_list(
  uuid, text, text, boolean, text, text, integer, text
) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reorder_tasks(uuid, jsonb) FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT ON public.task_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_comments TO authenticated;
GRANT ALL ON public.projects TO service_role;
GRANT ALL ON public.project_favorites TO service_role;
GRANT ALL ON public.project_members TO service_role;
GRANT ALL ON public.task_lists TO service_role;
GRANT ALL ON public.tasks TO service_role;
GRANT ALL ON public.task_events TO service_role;
GRANT ALL ON public.task_comments TO service_role;

ALTER TABLE public.task_comments REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_lists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
