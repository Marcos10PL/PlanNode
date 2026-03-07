"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
import {
  createProfileAccountSchema,
  type ProfileAccountSchema,
} from "@/schema";
import { ControlledInputField } from "@/components/ui/controlled-input-field";
import { ControlledPasswordField } from "@/components/ui/controlled-password-field";
import { Profile } from "@/types/entities";
import { updateProfileAction } from "@/actions";

function formatDate(value: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

export function ProfileSettingsForm({
  profile,
  pendingEmail,
}: {
  profile: Pick<
    Profile,
    "id" | "full_name" | "email" | "created_at" | "updated_at"
  >;
  pendingEmail: string | null;
}) {
  const t = useTranslations("profileSettings");
  const [pendingEmailState, setPendingEmail] = useState(pendingEmail);

  const form = useForm<ProfileAccountSchema>({
    resolver: zodResolver(
      createProfileAccountSchema(useTranslations("fields.errors")),
    ),
    defaultValues: {
      full_name: profile.full_name ?? "",
      new_email: profile.email,
      new_password: "",
    },
  });
  async function onSubmit(data: ProfileAccountSchema) {
    const result = await updateProfileAction(data);

    if (result.error) {
      console.log(result);
      toast.error(t("save_failed"));
    } else {
      toast.success(t("saved_successfully"));
      form.reset({ ...data, new_password: "" }); // Resetujesz tylko hasło
    }
  }

  // async function onSubmit(data: ProfileAccountSchema) {
  //   const supabase = createClient();

  //   const { data: updated, error: profileError } = await supabase
  //     .from("profiles")
  //     .update({ full_name: data.full_name || null })
  //     .eq("id", profile.id)
  //     .select("full_name, email, created_at, updated_at")
  //     .single();

  //   if (profileError) {
  //     toast.error(t("save_failed"));
  //     return;
  //   }

  //   const authPayload: { email?: string; password?: string } = {};

  //   if (
  //     !pendingEmailState &&
  //     data.new_email &&
  //     data.new_email !== profile.email
  //   ) {
  //     authPayload.email = data.new_email;
  //   }

  //   if (data.new_password) {
  //     authPayload.password = data.new_password;
  //   }

  //   const hasEmailChange = Boolean(authPayload.email);

  //   if (Object.keys(authPayload).length > 0) {
  //     const { error: authError } = await supabase.auth.updateUser(authPayload);
  //     if (authError) {
  //       toast.error(t("save_failed"));
  //       return;
  //     }

  //     if (authPayload.email) {
  //       setPendingEmail(authPayload.email);
  //     }
  //   }

  //   form.reset({
  //     full_name: updated.full_name ?? "",
  //     new_email: authPayload.email ?? updated.email,
  //     new_password: "",
  //   });
  //   toast.success(
  //     hasEmailChange ? t("email_update_success") : t("saved_successfully"),
  //   );
  // }

  return (
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

          {pendingEmailState && (
            <p className="text-sm text-muted-foreground">
              {t("pending_email_info", {
                pendingEmail: pendingEmailState,
                currentEmail: profile.email,
              })}
            </p>
          )}

          <ControlledInputField
            control={form.control}
            name="new_email"
            label={t("email")}
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            disabled={Boolean(pendingEmailState)}
            readOnly={Boolean(pendingEmailState)}
          />

          <ControlledPasswordField
            control={form.control}
            name="new_password"
            label={t("password")}
            placeholder={t("password_change_placeholder")}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? t("submitting") : t("submit")}
          </Button>

          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <p>
              {t("created_at")}: {formatDate(profile.created_at)}
            </p>
            <p>
              {t("updated_at")}: {formatDate(profile.updated_at)}
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
