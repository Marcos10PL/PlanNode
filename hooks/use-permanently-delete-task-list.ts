"use client";

import { permanentlyDeleteTaskListAction } from "@/actions/task/permanently-delete-task-list";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function usePermanentlyDeleteTaskList() {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const remove = async (listId: string) => {
    setIsPending(true);
    try {
      const result = await permanentlyDeleteTaskListAction(listId);
      if (result?.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("common.insufficient_role")
            : t("tasks.trash.delete_permanently.error"),
        );
        return false;
      }

      toast.success(t("tasks.trash.delete_permanently.success"));
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
