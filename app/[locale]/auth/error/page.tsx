import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  const t = await getTranslations("auth.error");
  const params = await searchParams;

  return (
    <>
      <CardTitle className="text-2xl">{t("title")}</CardTitle>
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          {t("code_error", { error: params.error })}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">{t("unspecified")}</p>
      )}
    </>
  );
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>;
}) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <Suspense>
          <CardHeader>
            <ErrorContent searchParams={searchParams} />
          </CardHeader>
        </Suspense>
      </Card>
    </div>
  );
}
