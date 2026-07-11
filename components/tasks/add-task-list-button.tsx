"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { TaskListModal } from "./create-task-list-modal";

type Props = {
  projectId: string;
};

export function AddTaskListButton({ projectId }: Props) {
  const t = useTranslations("tasks.list_create");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t("trigger")}</TooltipContent>
      </Tooltip>

      <TaskListModal
        projectId={projectId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
