"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_SORTS } from "@/const";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";

export function ProjectSortSelect() {
  const t = useTranslations("projects.sort");
  const router = useRouter();
  const searchParams = useSearchParams();

  const current = searchParams.get("sort") ?? PROJECT_SORTS.NEWEST;

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === PROJECT_SORTS.NEWEST) {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-full gap-1">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(PROJECT_SORTS).map((sort) => (
          <SelectItem key={sort} value={sort}>
            {t(sort)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
