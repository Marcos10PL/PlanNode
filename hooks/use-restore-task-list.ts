"use client";

import { restoreTaskListAction } from "@/actions/task/restore-task-list";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function useRestoreTaskList() {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const restore = async (listId: string) => {
    setIsPending(true);
    try {
      const result = await restoreTaskListAction(listId);
      if (result?.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("common.insufficient_role")
            : t("tasks.trash.restore_error"),
        );
        return false;
      }

      toast.success(t("tasks.trash.restore_success"));
      return true;
    } catch {
      toast.error(t("common.unexpected_error"));
      return false;
    } finally {
      setIsPending(false);
    }
  };

  return { restore, isPending };
}
