"use client";

import { resendConfirmationAction } from "@/actions/auth/resend-confirmation";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type SignUpSuccessResendButtonProps = {
  email: string;
};

export function SignUpSuccessResendButton({
  email,
}: SignUpSuccessResendButtonProps) {
  const t = useTranslations("auth.sign_up_success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResend = async () => {
    setIsSubmitting(true);
    try {
      const result = await resendConfirmationAction(email);
      if (result.error) {
        toast.error(t("resend_email_failed"));
        return;
      }
      toast.success(t("resend_email_success"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleResend}
      disabled={isSubmitting}
      className="mt-4 w-full"
    >
      {isSubmitting ? t("resending_email") : t("resend_email")}
    </Button>
  );
}
