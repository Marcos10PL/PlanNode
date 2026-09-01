"use client";

import { permanentlyDeleteTaskAction } from "@/actions/task/permanently-delete-task";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function usePermanentlyDeleteTask() {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const remove = async (taskId: string) => {
    setIsPending(true);
    try {
      const result = await permanentlyDeleteTaskAction(taskId);
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
