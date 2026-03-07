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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createUpdatePasswordSchema,
  type UpdatePasswordSchema,
} from "@/schema";
import { ControlledPasswordField } from "@/components/ui/controlled-password-field";
import { toast } from "sonner";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("auth.updatePassword");
  const router = useRouter();

  const form = useForm<UpdatePasswordSchema>({
    resolver: zodResolver(
      createUpdatePasswordSchema(useTranslations("fields.errors")),
    ),
    defaultValues: {
      password: "",
    },
  });

  const handleUpdatePassword = async (data: UpdatePasswordSchema) => {
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      router.replace(LINKS.dashboard);
    } catch {
      toast.error(t("error_generic"));
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

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
