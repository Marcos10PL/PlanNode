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
  variant = "ghost",
}: Props) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              size={"icon"}
              variant={variant}
              className={cn("size-7", className)}
              aria-label={label}
            >
              <Info className="size-7" />
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
