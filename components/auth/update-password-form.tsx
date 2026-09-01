"use client";

import { updatePasswordAction } from "@/actions/auth/update-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ControlledPasswordField } from "@/components/ui/controlled-password-field";
import { ERRORS, LINKS } from "@/const";
import { updatePasswordSchema, type UpdatePasswordSchema } from "@/schema";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.update_password");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(
      updatePasswordSchema(useTranslations("fields.errors")),
    ),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleUpdatePassword = async (data: UpdatePasswordSchema) => {
    try {
      const result = await updatePasswordAction(data);
      if (result.error) {
        if (result.error === ERRORS.SAME_PASSWORD) {
          toast.error(t("password_same_as_old"));
        } else {
          toast.error(t("error_generic"));
        }
        return;
      }
      setIsRedirecting(true);
      router.replace(LINKS.DASHBOARD);
    } catch {
      toast.error(tCommon("unexpected_error"));
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleUpdatePassword)}
            className="flex flex-col gap-4"
          >
            <ControlledPasswordField
              control={form.control}
              name="password"
              label={t("new_password")}
              placeholder={t("new_password")}
              autoComplete="new-password"
            />

            <ControlledPasswordField
              control={form.control}
              name="confirmPassword"
              label={t("confirm_password")}
              placeholder={t("confirm_password")}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || isRedirecting}
            >
              {form.formState.isSubmitting || isRedirecting
                ? t("submitting")
                : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
