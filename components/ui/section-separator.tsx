import { cn } from "@/utils";

type Props = {
  title?: string;
  className?: string;
};

export function SectionSeparator({ title, className }: Props) {
  return (
    <div
      className={cn(
        "relative h-0.5 mb-5 mt-1 min-w-full bg-sidebar-border text-[0.65rem] font-semibold text-center uppercase",
        className,
      )}
    >
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 group-data-[collapsible=icon]:hidden bg-sidebar px-2 text-muted-foreground">
        {title}
      </div>
    </div>
  );
}
