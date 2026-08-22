"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils";
import { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: "ghost" | "secondary" | "outline";
  className?: string;
};

export function TooltipIconButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant = "ghost",
  className,
}: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={cn("size-7", className)}
          disabled={disabled}
          onClick={onClick}
        >
          <Icon className={"size-4"} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
