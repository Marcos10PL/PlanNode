import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignUpSuccessResendButton } from "@/components/auth/sign-up-success-resend-button";
import { useTranslations } from "next-intl";
import { Suspense, use } from "react";
import { setRequestLocale } from "next-intl/server";
import { LocaleProp } from "@/types/props";

export default function Page({
  params,
  searchParams,
}: {
  params: LocaleProp;
  searchParams: Promise<{ email: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);

  const t = useTranslations("auth.sign_up_success");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("message")}</p>
          <Suspense>
            <SignUpButtonContent searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

async function SignUpButtonContent({
  searchParams,
}: {
  searchParams: Promise<{ email: string }>;
}) {
  const params = await searchParams;
  const { email } = params;
  return email ? <SignUpSuccessResendButton email={email} /> : null;
}
