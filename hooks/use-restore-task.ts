"use client";

import { restoreTaskAction } from "@/actions/task/restore-task";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function useRestoreTask() {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const restore = async (taskId: string) => {
    setIsPending(true);
    try {
      const result = await restoreTaskAction(taskId);
      if (result?.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("common.insufficient_role")
            : result.error === ERRORS.CANNOT_RESTORE_WHILE_ANCESTOR_TRASHED
              ? t("tasks.trash.restore_ancestor_trashed_error")
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
