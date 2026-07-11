"use client";

import { deleteTaskListAction } from "@/actions/task/delete-task-list";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteTaskList() {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const remove = async (listId: string) => {
    setIsPending(true);
    try {
      const result = await deleteTaskListAction(listId);
      if (result?.error) {
        toast.error(
          result.error === ERRORS.CANNOT_DELETE_LAST_LIST
            ? t("tasks.list_delete.last_list_error")
            : t("tasks.list_delete.error"),
        );
        return false;
      }

      toast.success(t("tasks.list_delete.success"));
      return true;
    } catch {
      toast.error(t("common.unexpected_error"));
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { remove, isPending };
}
