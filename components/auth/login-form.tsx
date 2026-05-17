"use client";

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
import { LINKS } from "@/const";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { loginSchema, LoginSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldError } from "../ui/field";
import { toast } from "sonner";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledPasswordField } from "@/components/ui/controlled-password-field";
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

  async function resendConfirmationEmail(email: string) {
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
      return;
    }

    toast.success(t("resend_email_success"));
  }

  async function onSubmit(data: LoginSchema) {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (error) throw error;
      toast.success(t("logged_in_successfully"));
      router.replace(LINKS.dashboard);
    } catch (error: any) {
      if (error.code === "invalid_credentials") {
        toast.error(t("invalid_credentials"));
      } else if (error.code === "email_not_confirmed") {
        toast.error(t("email_not_confirmed"), {
          action: {
            label: t("resend_email"),
            onClick: async () => {
              await resendConfirmationEmail(data.email);
            },
          },
        });
      } else {
        toast.error(t("login_failed"));
      }
    }
  }

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
                <Link href={LINKS.forgotPassword} className="ml-auto text-sm">
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
              <Link href={LINKS.signUp}>{tAuth("sign_up")}</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
