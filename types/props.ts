import { UpdateTaskSchema } from "@/schema";
import { Task, WorkspaceMember } from "@/types/dto";
import { TaskStatus } from "@/types/entities";
import { type DragEndEvent } from "@dnd-kit/react";

export type LocaleProp = Promise<{
  locale: string;
}>;

export type TaskItemProps = {
  task: Task;
  members: WorkspaceMember[];
  canEdit: boolean;
  canManage: boolean;
  dragHandle?: React.ReactNode;
  onUpdateTask: (
    taskId: string,
    patch: Partial<Task>,
    serverPatch: UpdateTaskSchema,
    fallbackErrorKey: string,
  ) => Promise<{ error?: string } | undefined>;
  subtasks?: Task[];
  onSubtaskDragEnd?: (event: DragEndEvent) => void;
  onAddSubtask?: () => void;
  hiddenStatuses?: Set<TaskStatus>;
};

export type TaskCoreProps = Pick<
  TaskItemProps,
  "members" | "canEdit" | "canManage" | "onUpdateTask"
>;

export type SortableTaskItemProps = Omit<TaskItemProps, "dragHandle"> & {
  index: number;
  dragEnabled: boolean;
};

export type SubtaskListProps = TaskCoreProps & {
  subtasks: Task[];
  onDragEnd: (event: DragEndEvent) => void;
  onAddSubtask: () => void;
};
