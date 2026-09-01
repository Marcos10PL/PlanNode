"use client";

import { toggleProjectCompletedAction } from "@/actions/project/toggle-completed";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function useToggleProjectCompleted(
  projectId: string,
  initialIsCompleted: boolean,
) {
  const t = useTranslations("common");
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(initialIsCompleted);
  const [prevInitialIsCompleted, setPrevInitialIsCompleted] =
    useState(initialIsCompleted);

  if (initialIsCompleted !== prevInitialIsCompleted) {
    setPrevInitialIsCompleted(initialIsCompleted);
    setIsCompleted(initialIsCompleted);
  }

  const toggle = async () => {
    const next = !isCompleted;
    setIsCompleted(next);

    try {
      const result = await toggleProjectCompletedAction(projectId, next);
      if (result?.error) {
        setIsCompleted(!next);
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? t("insufficient_role")
            : t("unexpected_error"),
        );
        router.refresh();
      }
    } catch {
      setIsCompleted(!next);
      toast.error(t("unexpected_error"));
      router.refresh();
    }
  };

  return { isCompleted, toggle };
}
