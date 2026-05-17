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
import { Link } from "../ui/link";
import { LINKS } from "@/const";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { registerSchema, RegisterSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledPasswordField } from "@/components/ui/controlled-password-field";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.sign_up_form");
  const tAuth = useTranslations("auth");

  const router = useRouter();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(
      registerSchema(useTranslations("fields.errors")),
    ),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterSchema) {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}${LINKS.dashboard}`,
          data: { full_name: data.full_name },
        },
      });
      if (error) throw error;
      router.replace(
        `${LINKS.signUpSuccess}?email=${encodeURIComponent(data.email)}`,
      );
    } catch (error: any) {
      if (error.code === "user_already_exists") {
        toast.error(t("user_already_exists"));
      } else {
        toast.error(t("sign_up_failed"));
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
              name="full_name"
              label={t("full_name")}
              placeholder={t("full_name")}
              autoComplete="name"
            />

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
              autoComplete="new-password"
            />

            <ControlledPasswordField
              control={form.control}
              name="confirmPassword"
              label={t("repeat_password")}
              autoComplete="new-password"
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
              <Link href={LINKS.login}>{tAuth("sign_in")}</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
