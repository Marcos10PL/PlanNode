"use client";

import { LINKS } from "@/const";
import { createClient } from "@/lib/supabase/client";
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

  async function handleResend() {
    setIsSubmitting(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}${LINKS.dashboard}`,
      },
    });

    if (error) {
      toast.error(t("resend_email_failed"));
      setIsSubmitting(false);
      return;
    }

    toast.success(t("resend_email_success"));
    setIsSubmitting(false);
  }

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
