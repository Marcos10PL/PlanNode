"use client";

import { toggleProjectFavoriteAction } from "@/actions/project/toggle-favorite";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useToggleProjectFavorite(
  projectId: string,
  initialIsFavorite: boolean,
) {
  const t = useTranslations("common");
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const toggle = async () => {
    const next = !isFavorite;
    setIsFavorite(next);

    try {
      const result = await toggleProjectFavoriteAction(projectId, next);
      if (result?.error) {
        setIsFavorite(!next);
        toast.error(t("unexpected_error"));
        router.refresh();
      }
    } catch {
      setIsFavorite(!next);
      toast.error(t("unexpected_error"));
      router.refresh();
    }
  };

  return { isFavorite, toggle };
}
