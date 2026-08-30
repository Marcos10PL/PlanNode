"use client";

import { updateNotificationPreferencesAction } from "@/actions/notifications/update-notification-preferences";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InfoPopover } from "@/components/ui/info-popover";
import { Switch } from "@/components/ui/switch";
import { NOTIFICATION_TYPES } from "@/const";
import { NotificationPreference } from "@/types/dto";
import { NotificationType } from "@/types/entities";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CHANNELS = {
  EMAIL: "emailEnabled",
  IN_APP: "inAppEnabled",
} as const;

type Channel = (typeof CHANNELS)[keyof typeof CHANNELS];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NotificationPreference[];
};

const NOTIFICATION_TYPE_LIST = Object.values(NOTIFICATION_TYPES);

export function NotificationPreferencesModal({
  open,
  onOpenChange,
  preferences,
}: Props) {
  const t = useTranslations("notifications");
  const tCommon = useTranslations("common");

  const [values, setValues] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{
    channel: Channel;
    checked: boolean;
  } | null>(null);

  useEffect(() => {
    if (open) setValues(preferences);
  }, [open, preferences]);

  const getPref = (type: NotificationType, source = values) =>
    source.find(v => v.type === type) ?? {
      type,
      emailEnabled: true,
      inAppEnabled: true,
    };

  const setPref = (type: NotificationType, pref: NotificationPreference) => {
    setValues(prev =>
      prev.some(v => v.type === type)
        ? prev.map(v => (v.type === type ? pref : v))
        : [...prev, pref],
    );
  };

  const applyToggle = (
    type: NotificationType,
    channel: Channel,
    checked: boolean,
  ) => {
    setPref(type, { ...getPref(type), [channel]: checked });
  };

  const handleToggle = (
    type: NotificationType,
    channel: Channel,
    checked: boolean,
  ) => {
    if (type === NOTIFICATION_TYPES.WORKSPACE_INVITATION && !checked) {
      const current = getPref(type);
      const otherChannel: Channel =
        channel === CHANNELS.EMAIL ? CHANNELS.IN_APP : CHANNELS.EMAIL;

      if (!current[otherChannel]) {
        setPendingToggle({ channel, checked });
        return;
      }
    }

    applyToggle(type, channel, checked);
  };

  const confirmDisableInvitation = () => {
    if (pendingToggle) {
      applyToggle(
        NOTIFICATION_TYPES.WORKSPACE_INVITATION,
        pendingToggle.channel,
        pendingToggle.checked,
      );
    }
    setPendingToggle(null);
  };

  const isDirty = NOTIFICATION_TYPE_LIST.some(type => {
    const current = getPref(type);
    const original = getPref(type, preferences);
    return (
      current.emailEnabled !== original.emailEnabled ||
      current.inAppEnabled !== original.inAppEnabled
    );
  });

  const handleCancel = () => {
    setValues(preferences);
    onOpenChange(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateNotificationPreferencesAction({
        preferences: values,
      });
      if (result?.error) {
        toast.error(tCommon("unexpected_error"));
        return;
      }
      onOpenChange(false);
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-md"
          onOpenAutoFocus={e => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>{t("settings.title")}</DialogTitle>
            <DialogDescription>{t("settings.description")}</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col">
            <div className="grid grid-cols-[1fr_3rem_3rem] items-center gap-x-4 pb-2 text-xs text-muted-foreground">
              <span />
              <span className="text-center">{t("settings.email_label")}</span>
              <span className="text-center">{t("settings.in_app_label")}</span>
            </div>

            {NOTIFICATION_TYPE_LIST.map(type => {
              const pref = getPref(type);
              const invitationBroken =
                type === NOTIFICATION_TYPES.WORKSPACE_INVITATION &&
                !pref.emailEnabled &&
                !pref.inAppEnabled;

              return (
                <div
                  key={type}
                  className="grid grid-cols-[1fr_3rem_3rem] items-center gap-x-4 border-t py-3 first:border-t-0"
                >
                  <div className="min-w-0">
                    <span className="text-sm">
                      {t(`settings.${type}`)}{" "}
                      {invitationBroken && (
                        <InfoPopover
                          label={t("settings.invitation_disabled_tooltip")}
                          className="inline-flex size-5 align-middle text-destructive"
                        >
                          {t("settings.invitation_disabled_hint")}
                        </InfoPopover>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.emailEnabled}
                      onCheckedChange={checked =>
                        handleToggle(type, CHANNELS.EMAIL, checked)
                      }
                    />
                  </div>
                  <div className="flex justify-center">
                    <Switch
                      checked={pref.inAppEnabled}
                      onCheckedChange={checked =>
                        handleToggle(type, CHANNELS.IN_APP, checked)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              {t("settings.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? t("settings.saving") : t("settings.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={pendingToggle !== null}
        onOpenChange={openState => {
          if (!openState) setPendingToggle(null);
        }}
        onConfirm={confirmDisableInvitation}
        title={t("settings.invitation_warning_title")}
        description={t("settings.invitation_warning_description")}
      />
    </>
  );
}
