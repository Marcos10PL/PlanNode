"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledPasswordField } from "@/components/ui/controlled-password-field";
import { profileSettingsSchema, ProfileSettingsSchema } from "@/schema";
import { updateProfileAction } from "@/actions/profile/update-profile";
import { updateEmailAction } from "@/actions/profile/update-email";
import { updatePasswordAction } from "@/actions/profile/update-password";
import { useUser } from "@/components/providers/user-provider";
import { formatDate } from "@/lib/utils";
import { ERRORS } from "@/const";

export function ProfileForm() {
  const { profile, user } = useUser();
  const t = useTranslations("profile_settings");
  const locale = useLocale();
  const [pendingEmail, setPendingEmail] = useState(user.new_email ?? null);

  const form = useForm<ProfileSettingsSchema>({
    resolver: zodResolver(
      profileSettingsSchema(useTranslations("fields.errors")),
    ),
    defaultValues: {
      full_name: profile.full_name ?? "",
      email: profile.email,
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: ProfileSettingsSchema) {
    const tasks: Promise<string | null>[] = [];

    if (data.full_name !== profile.full_name) {
      tasks.push(
        updateProfileAction({ full_name: data.full_name }).then(result =>
          "error" in result ? t("save_failed") : null,
        ),
      );
    }

    if (data.email !== profile.email && !pendingEmail) {
      tasks.push(
        updateEmailAction({ email: data.email }).then(result => {
          if ("error" in result) return t("email_update_failed");
          setPendingEmail(data.email);
          return null;
        }),
      );
    }

    if (data.password) {
      tasks.push(
        updatePasswordAction({
          password: data.password,
          confirmPassword: data.confirmPassword,
        }).then(result => {
          if (!("error" in result)) return null;
          if (result.error === ERRORS.samePassword)
            return t("password_same_as_old");
          return t("password_update_failed");
        }),
      );
    }

    const errors = (await Promise.all(tasks)).filter(Boolean);
    errors.forEach(msg => toast.error(msg!));

    if (errors.length === 0 && tasks.length > 0)
      toast.success(t("saved_successfully"));

    form.reset({ ...data, password: "", confirmPassword: "" });
  }

  return (
    <Card className="flex-1 border-0 max-w-5xl">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6"
        >
          <ControlledInputField
            control={form.control}
            name="full_name"
            label={t("full_name")}
            placeholder={t("full_name")}
            autoComplete="name"
          />

          <Separator />

          <div className="flex flex-col gap-4">
            <ControlledInputField
              control={form.control}
              name="email"
              label={t("email")}
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              disabled={Boolean(pendingEmail)}
              readOnly={Boolean(pendingEmail)}
            />
            {pendingEmail && (
              <p className="text-sm text-muted-foreground">
                {t("pending_email_info", {
                  pendingEmail,
                  currentEmail: profile.email,
                })}
              </p>
            )}
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {t("password_change_placeholder")}
            </p>
            <ControlledPasswordField
              control={form.control}
              name="password"
              label={t("new_password")}
              autoComplete="new-password"
            />
            <ControlledPasswordField
              control={form.control}
              name="confirmPassword"
              label={t("confirm_password")}
              autoComplete="new-password"
            />
          </div>

          <Separator />

          <div className="flex flex-col-reverse md:flex-row gap-6 md:items-end justify-between">
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                {t("created_at")}: {formatDate(profile.created_at, locale)}
              </p>
              <p>
                {t("updated_at")}: {formatDate(profile.updated_at, locale)}
              </p>
            </div>
            <Button
              type="submit"
              className="w-full md:w-fit"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              {form.formState.isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
