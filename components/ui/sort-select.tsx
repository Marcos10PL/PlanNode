"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";

type Props<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly T[];
  getLabel: (value: T) => string;
  className?: string;
};

export function SortSelect<T extends string>({
  value,
  onChange,
  options,
  getLabel,
  className,
}: Props<T>) {
  const t = useTranslations("common");

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm text-muted-foreground">{t("sort_by")}</p>
      <Select value={value} onValueChange={v => onChange(v as T)}>
        <SelectTrigger size="sm" className={cn("w-36", className)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map(option => (
            <SelectItem key={option} value={option}>
              {getLabel(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
