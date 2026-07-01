"use client";

import { acceptInvitationAction } from "@/actions/workspace/accept-invitation";
import { declineInvitationAction } from "@/actions/workspace/decline-invitation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

export function Actions({ token }: { token: string }) {
  const t = useTranslations("invite_page");
  const tCommon = useTranslations("common");

  const [loading, setLoading] = useState(false);

  const decline = async () => {
    setLoading(true);
    const { error } = await declineInvitationAction(token);
    if (error) {
      toast.error(tCommon("unexpected_error"));
      setLoading(false);
    }
  };

  const accept = async () => {
    setLoading(true);
    const { error } = await acceptInvitationAction(token);
    if (error) {
      toast.error(tCommon("unexpected_error"));
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-2">
      <form action={decline} className="flex-1">
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={loading}
        >
          {t("decline")}
        </Button>
      </form>
      <form action={accept} className="flex-1">
        <Button type="submit" className="w-full" disabled={loading}>
          {t("accept")}
        </Button>
      </form>
    </div>
  );
}
