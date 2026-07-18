import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils";
import { Info } from "lucide-react";
import { Button } from "./button";

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
  variant?: "outline" | "ghost";
};

export function InfoPopover({
  label,
  children,
  className,
  variant = "outline",
}: Props) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild className="self-end!">
            <Button
              variant={variant}
              className={cn("size-9 py-4", className)}
              aria-label={label}
            >
              <Info className="size-8" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-72 p-3 max-h-60 overflow-y-auto text-sm whitespace-pre-wrap"
        align="end"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
