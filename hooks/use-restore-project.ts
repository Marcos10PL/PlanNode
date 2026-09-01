"use client";

import { restoreProjectAction } from "@/actions/project/restore-project";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function useRestoreProject() {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const restore = async (projectId: string) => {
    setIsPending(true);
    try {
      const result = await restoreProjectAction(projectId);
      if (result?.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("common.insufficient_role")
            : t("projects.trash.restore_error"),
        );
        return false;
      }

      toast.success(t("projects.trash.restore_success"));
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
