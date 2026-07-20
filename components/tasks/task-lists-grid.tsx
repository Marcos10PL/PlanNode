"use client";

import { reorderTaskListsAction } from "@/actions/task/reorder-task-lists";
import { ProjectListSummary } from "@/types/dto";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useEffect, useState } from "react";
import { SortableTaskListCard } from "./sortable-task-list-card";

type Props = {
  lists: ProjectListSummary[];
  projectId: string;
  canEdit: boolean;
};

export function TaskListsGrid({ lists, projectId, canEdit }: Props) {
  const [localLists, setLocalLists] = useState(lists);

  useEffect(() => {
    setLocalLists(lists);
  }, [lists]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id as string | undefined;
    if (!draggedId) return;

    const ids = localLists.map(list => list.id);
    const movedIds = move(ids, event);

    const oldPosition = new Map(ids.map((id, index) => [id, index]));
    const changes = movedIds
      .map((id, position) => ({ id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    setTimeout(() => {
      setLocalLists(prev => {
        const byId = new Map(prev.map(list => [list.id, list]));
        return movedIds.map(id => byId.get(id)!);
      });
      reorderTaskListsAction(projectId, changes);
    }, 0);
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {localLists.map((list, index) => (
          <SortableTaskListCard
            key={list.id}
            list={list}
            index={index}
            projectId={projectId}
            canEdit={canEdit}
          />
        ))}
      </div>
    </DragDropProvider>
  );
}
