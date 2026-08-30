"use client";

import { cn } from "@/utils";
import { sanitizeHtml } from "@/utils/sanitize";

type Props = {
  html: string;
  className?: string;
};

export function TaskDescriptionView({ html, className }: Props) {
  return (
    <div
      className={cn(
        "break-all text-sm [&_a]:text-primary [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_p]:min-h-[1.25em] [&_ul]:list-disc [&_ul]:pl-5",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
