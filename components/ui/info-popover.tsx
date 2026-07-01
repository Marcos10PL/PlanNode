import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { Button } from "./button";

export default function InfoPopover({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild className="self-end!">
        <Button variant="outline" className="size-9 py-4" aria-label={label}>
          <Info className="size-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        {children}
      </PopoverContent>
    </Popover>
  );
}
