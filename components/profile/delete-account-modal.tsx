"use client";

import { deleteAccountAction } from "@/actions/profile/delete-account";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ERRORS } from "@/const";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountModal({ open, onOpenChange }: Props) {
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const t = useTranslations("profile_settings");

  const handleClose = () => onOpenChange(false);
  const resetState = () => setPassword("");

  const handleDelete = async () => {
    setIsPending(true);
    const result = await deleteAccountAction({ password });

    if (result?.error === ERRORS.CANNOT_DELETE_ACCOUNT_AS_SOLE_OWNER) {
      toast.error(t("delete_account_blocked_error"));
    } else if (result?.error === ERRORS.INVALID_CREDENTIALS) {
      toast.error(t("current_password_incorrect"));
    } else if (result?.error) {
      toast.error(t("delete_account_error"));
    }

    setIsPending(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) handleClose();
      }}
    >
      <DialogContent
        onAnimationEnd={() => {
          if (!open) resetState();
        }}
      >
        <DialogHeader>
          <DialogTitle>{t("delete_account_title")}</DialogTitle>
          <DialogDescription>
            {t("delete_account_description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="confirm-password">
            {t("delete_account_confirm_label")}
          </Label>
          <Input
            id="confirm-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            {t("delete_account_cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={password.length === 0 || isPending}
            onClick={handleDelete}
          >
            {isPending
              ? t("delete_account_submitting")
              : t("delete_account_submit")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
