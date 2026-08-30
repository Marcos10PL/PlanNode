"use client";

import { TooltipIconButton } from "@/components/ui/tooltip-icon-button";
import { NotificationPreference } from "@/types/dto";
import { Settings } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { NotificationPreferencesModal } from "./notification-preferences-modal";

type Props = {
  preferences: NotificationPreference[];
};

export function NotificationSettingsButton({ preferences }: Props) {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipIconButton
        icon={Settings}
        label={t("settings_button")}
        onClick={() => setOpen(true)}
        className="text-muted-foreground"
      />
      <NotificationPreferencesModal
        open={open}
        onOpenChange={setOpen}
        preferences={preferences}
      />
    </>
  );
}
