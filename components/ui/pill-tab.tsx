"use client";

import { cn } from "@/utils";
import Link from "next/link";

type Props = {
  label: string;
  active: boolean;
  className?: string;
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void });

export function PillTab({ label, active, className, href, onClick }: Props) {
  const classes = cn(
    "shrink-0 whitespace-nowrap px-3 py-2 text-sm border border-b-0 rounded-t-md",
    active
      ? "bg-muted border-primary/30 pointer-events-none"
      : "border-transparent hover:bg-muted transition-colors",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {label}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(classes, "cursor-pointer")}
    >
      {label}
    </button>
  );
}
