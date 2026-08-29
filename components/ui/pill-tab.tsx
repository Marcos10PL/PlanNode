import { cn } from "@/utils";
import Link from "next/link";

type Props = {
  label: string;
  href: string;
  active: boolean;
  className?: string;
};

export function PillTab({ label, href, active, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "shrink-0 whitespace-nowrap px-3 py-2 text-sm border border-b-0 rounded-t-md",
        active
          ? "bg-muted border-primary/30 pointer-events-none"
          : "border-transparent hover:bg-muted transition-colors",
        className,
      )}
    >
      {label}
    </Link>
  );
}
