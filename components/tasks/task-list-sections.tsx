import { TaskListWithTasks, WorkspaceMember } from "@/types/dto";
import { TaskListSection } from "./task-list-section";

type Props = {
  lists: TaskListWithTasks[];
  members: WorkspaceMember[];
  canEdit: boolean;
};

export function TaskListSections({ lists, members, canEdit }: Props) {
  return (
    <div className="flex flex-col gap-6">
      {lists.map(list => (
        <TaskListSection
          key={list.id}
          list={list}
          members={members}
          canEdit={canEdit}
        />
      ))}
    </div>
  );
}
