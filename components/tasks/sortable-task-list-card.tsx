"use client";

import { SortableEntityCard } from "@/components/ui/sortable-entity-card";
import { ProjectListSummary } from "@/types/dto";
import { TaskListCard } from "./task-list-card";

type Props = {
  list: ProjectListSummary;
  index: number;
  projectId: string;
  canEdit: boolean;
};

export function SortableTaskListCard({
  list,
  index,
  projectId,
  canEdit,
}: Props) {
  return (
    <SortableEntityCard id={list.id} index={index} disabled={!canEdit}>
      {dragHandle => (
        <TaskListCard
          list={list}
          projectId={projectId}
          canEdit={canEdit}
          dragHandle={dragHandle}
        />
      )}
    </SortableEntityCard>
  );
}
