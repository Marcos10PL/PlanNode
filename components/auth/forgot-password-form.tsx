"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { LINKS } from "@/const";
import {
  createForgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/schema";
import { ControlledInputField } from "@/components/ui/controlled-input-field";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.forgot_password");
  const tAuth = useTranslations("auth");
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(
      createForgotPasswordSchema(useTranslations("fields.errors")),
    ),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordSchema) {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}${LINKS.updatePassword}`,
      });
      if (error) throw error;

      toast.success(t("success_description"));
      setSuccess(true);
    } catch (error: any) {
      toast.error(error?.message ?? t("error_generic"));
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("success_title")}</CardTitle>
            <CardDescription>{t("success_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("success_message")}
            </p>
            <div className="mt-4 text-center text-sm">
              {t("have_account")}{" "}
              <Link href={LINKS.login} className="underline underline-offset-4">
                {tAuth("sign_in")}
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <ControlledInputField
                control={form.control}
                name="email"
                label={t("email")}
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? t("submitting") : t("submit")}
              </Button>

              <div className="mt-4 text-center text-sm">
                {t("have_account")}{" "}
                <Link
                  href={LINKS.login}
                  className="underline underline-offset-4"
                >
                  {tAuth("sign_in")}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
