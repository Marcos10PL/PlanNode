"use client";

import { reorderTaskListsAction } from "@/actions/task/reorder-task-lists";
import { ERRORS } from "@/const";
import { ProjectListSummary } from "@/types/dto";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { SortableTaskListCard } from "./sortable-task-list-card";

type Props = {
  lists: ProjectListSummary[];
  projectId: string;
  canEdit: boolean;
};

export function TaskListsGrid({ lists, projectId, canEdit }: Props) {
  const t = useTranslations("common");
  const router = useRouter();
  const [localLists, setLocalLists] = useState(lists);
  const [prevLists, setPrevLists] = useState(lists);

  if (lists !== prevLists) {
    setPrevLists(lists);
    setLocalLists(lists);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return;

    const draggedId = event.operation.source?.id as string | undefined;
    if (!draggedId) return;

    const previousOrder = localLists;
    const ids = previousOrder.map(list => list.id);
    const movedIds = move(ids, event);

    const oldPosition = new Map(ids.map((id, index) => [id, index]));
    const changes = movedIds
      .map((id, position) => ({ id, position }))
      .filter(({ id, position }) => oldPosition.get(id) !== position);

    if (changes.length === 0) return;

    setTimeout(async () => {
      setLocalLists(prev => {
        const byId = new Map(prev.map(list => [list.id, list]));
        return movedIds.map(id => byId.get(id)!);
      });

      try {
        const result = await reorderTaskListsAction(projectId, changes);
        if (result?.error) {
          setLocalLists(previousOrder);
          toast.error(
            result.error === ERRORS.INSUFFICIENT_ROLE
              ? t("insufficient_role")
              : t("unexpected_error"),
          );
          router.refresh();
        }
      } catch {
        setLocalLists(previousOrder);
        toast.error(t("unexpected_error"));
        router.refresh();
      }
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
