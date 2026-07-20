"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils";
import { GripVertical } from "lucide-react";
import { Ref } from "react";

type Props = {
  ref: Ref<HTMLButtonElement>;
  className?: string;
  iconClassName?: string;
};

export function DragHandle({ ref, className, iconClassName }: Props) {
  return (
    <Button
      ref={ref}
      type="button"
      size="icon"
      variant="ghost"
      className={cn(
        "w-fit h-fit cursor-grab touch-none text-muted-foreground/40 hover:text-muted-foreground active:cursor-grabbing",
        className,
      )}
    >
      <GripVertical className={cn("size-4", iconClassName)} />
    </Button>
  );
}
