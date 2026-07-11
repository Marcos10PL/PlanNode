"use client";

import { deleteProjectAction } from "@/actions/project/delete-project";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function useDeleteProject() {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const remove = async (projectId: string) => {
    setIsPending(true);
    try {
      const result = await deleteProjectAction(projectId);
      if (result?.error) {
        toast.error(t("projects.delete.error"));
        return false;
      }

      toast.success(t("projects.delete.success"));
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
