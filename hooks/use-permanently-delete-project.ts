"use client";

import { permanentlyDeleteProjectAction } from "@/actions/project/permanently-delete-project";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function usePermanentlyDeleteProject() {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const remove = async (projectId: string) => {
    setIsPending(true);
    try {
      const result = await permanentlyDeleteProjectAction(projectId);
      if (result?.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("common.insufficient_role")
            : t("projects.trash.delete_permanently.error"),
        );
        return false;
      }

      toast.success(t("projects.trash.delete_permanently.success"));
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
