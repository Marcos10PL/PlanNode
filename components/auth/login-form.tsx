"use client";

import { loginAction } from "@/actions/auth/login";
import { resendConfirmationAction } from "@/actions/auth/resend-confirmation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledPasswordField } from "@/components/ui/controlled-password-field";
import { ERRORS, LINKS } from "@/const";
import { loginSchema, LoginSchema } from "@/schema";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FieldError } from "../ui/field";
import { Link } from "../ui/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.login");
  const tAuth = useTranslations("auth");
  const router = useRouter();

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema(useTranslations("fields.errors"))),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resendConfirmationEmail = async (email: string) => {
    const result = await resendConfirmationAction(email);
    if (result.error) {
      toast.error(t("resend_email_failed"));
      return;
    }
    toast.success(t("resend_email_success"));
  };

  const onSubmit = async (data: LoginSchema) => {
    const result = await loginAction(data);
    if (result.error) {
      if (result.error === ERRORS.INVALID_CREDENTIALS) {
        toast.error(t("invalid_credentials"));
      } else if (result.error === ERRORS.EMAIL_NOT_CONFIRMED) {
        toast.error(t("email_not_confirmed"), {
          action: {
            label: t("resend_email"),
            onClick: () => resendConfirmationEmail(data.email),
          },
        });
      } else {
        toast.error(t("login_failed"));
      }
      return;
    }
    toast.success(t("logged_in_successfully"));
    router.replace(LINKS.DASHBOARD);
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

            <ControlledPasswordField
              control={form.control}
              name="password"
              label={t("password")}
              autoComplete="current-password"
              labelRight={
                <Link href={LINKS.FORGOT_PASSWORD} className="ml-auto text-sm">
                  {t("forgot_password")}
                </Link>
              }
            />

            {form.formState.errors.root?.message && (
              <FieldError>{form.formState.errors.root.message}</FieldError>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? t("submitting") : t("submit")}
            </Button>

            <div className="mt-4 text-center text-sm">
              {t("no_account")}{" "}
              <Link href={LINKS.SIGN_UP}>{tAuth("sign_up")}</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
