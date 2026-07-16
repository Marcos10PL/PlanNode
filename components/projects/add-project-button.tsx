"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { cloneElement, useState } from "react";
import { ProjectModal } from "./project-modal";

type Props = {
  workspaceId: string;
  trigger?: React.ReactElement<{ onClick?: () => void }>;
};

export function AddProjectButton({ workspaceId, trigger }: Props) {
  const t = useTranslations("projects.create");
  const [open, setOpen] = useState(false);

  const openModal = () => setOpen(true);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          {trigger ? (
            cloneElement(trigger, { onClick: openModal })
          ) : (
            <Button variant="ghost" size="icon" onClick={openModal}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>{t("trigger")}</TooltipContent>
      </Tooltip>

      <ProjectModal
        workspaceId={workspaceId}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
