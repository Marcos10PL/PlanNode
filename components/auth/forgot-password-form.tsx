"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { forgotPasswordAction } from "@/actions/auth/forgot-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { LINKS } from "@/const";
import { Link } from "@/i18n/navigation";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "@/schema";
import { cn } from "@/utils";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.forgot_password");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(
      forgotPasswordSchema(useTranslations("fields.errors")),
    ),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      const result = await forgotPasswordAction(data);
      if (result.error) {
        toast.error(t("error_generic"));
        return;
      }
      toast.success(t("success_description"));
      setSuccess(true);
    } catch {
      toast.error(tCommon("unexpected_error"));
    }
  };

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
              <Link href={LINKS.LOGIN} className="underline underline-offset-4">
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
                  href={LINKS.LOGIN}
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
