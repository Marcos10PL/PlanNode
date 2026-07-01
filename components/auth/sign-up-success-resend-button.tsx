"use client";

import { resendConfirmationAction } from "@/actions/auth/resend-confirmation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  email: string;
};

export function SignUpSuccessResendButton({ email }: Props) {
  const t = useTranslations("auth.sign_up_success");
  const tCommon = useTranslations("common");
  const [isPending, setIsPending] = useState(false);

  const handleResend = async () => {
    setIsPending(true);
    try {
      const result = await resendConfirmationAction(email);
      if (result.error) {
        toast.error(t("resend_email_failed"));
        return;
      }
      toast.success(t("resend_email_success"));
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleResend}
      disabled={isPending}
      className="mt-4 w-full"
    >
      {isPending ? t("resending_email") : t("resend_email")}
    </Button>
  );
}
