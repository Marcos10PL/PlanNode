"use client";

import { signUpAction } from "@/actions/auth/sign-up";
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
import { registerSchema, RegisterSchema } from "@/schema";
import { cn } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Link } from "../ui/link";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.sign_up_form");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const router = useRouter();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema(useTranslations("fields.errors"))),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const result = await signUpAction(data);
      if (result.error) {
        if (result.error === ERRORS.USER_ALREADY_EXISTS) {
          toast.error(t("user_already_exists"));
        } else {
          toast.error(t("sign_up_failed"));
        }
        return;
      }
      router.replace(
        `${LINKS.SIGN_UP_SUCCESS}?email=${encodeURIComponent(data.email)}`,
      );
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
              <Link href={LINKS.LOGIN}>{tAuth("sign_in")}</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
