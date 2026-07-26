"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  label: string;
  onClick: () => void;
};

export function AddRowButton({ label, onClick }: Props) {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start text-muted-foreground rounded-none hover:bg-accent/50 h-11 pl-2"
      onClick={onClick}
    >
      <Plus className="h-4 w-4" />
      {label}
    </Button>
  );
}
