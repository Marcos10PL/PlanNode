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

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

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

-- Policies: projects
-- Uses the row's own columns instead of can_access_project() — a self-lookup
-- through the function cannot see a row inserted by the same statement,
-- which breaks INSERT ... RETURNING.
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

CREATE POLICY "Non-guest members can create projects"
ON public.projects FOR INSERT
WITH CHECK (
  public.get_workspace_member_role(workspace_id, (SELECT auth.uid())) IN ('owner', 'admin', 'member')
  AND created_by = (SELECT auth.uid())
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

CREATE POLICY "Admins/owners can add project members"
ON public.project_members FOR INSERT
WITH CHECK (public.is_project_manager(project_id, (SELECT auth.uid())));

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

-- Trigger: add default task list and creator membership when project is created
CREATE OR REPLACE FUNCTION public.add_default_task_list()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.task_lists (project_id, name, position)
  VALUES (NEW.id, 'Tasks', 0);

  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO public.project_members (project_id, id, added_by_id)
    VALUES (NEW.id, NEW.created_by, NEW.created_by);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE TRIGGER on_project_created
  AFTER INSERT ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.add_default_task_list();

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
CREATE INDEX idx_project_members_id ON public.project_members(id);
CREATE INDEX idx_project_favorites_user_position ON public.project_favorites(user_id, position);
CREATE INDEX idx_task_lists_project_id ON public.task_lists(project_id, position);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_list_id ON public.tasks(list_id, position);
CREATE INDEX idx_tasks_assignee_due ON public.tasks(assignee_id, due_date);
CREATE INDEX idx_tasks_project_status ON public.tasks(project_id, status);

-- Permissions
REVOKE ALL ON public.projects FROM anon;
REVOKE ALL ON public.project_favorites FROM anon;
REVOKE ALL ON public.project_members FROM anon;
REVOKE ALL ON public.task_lists FROM anon;
REVOKE ALL ON public.tasks FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_access_project(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.can_edit_project(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_project_manager(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.add_default_task_list() FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_favorites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_lists TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.projects TO service_role;
GRANT ALL ON public.project_favorites TO service_role;
GRANT ALL ON public.project_members TO service_role;
GRANT ALL ON public.task_lists TO service_role;
GRANT ALL ON public.tasks TO service_role;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.task_lists;
