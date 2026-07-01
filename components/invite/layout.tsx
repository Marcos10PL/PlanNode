import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export async function Layout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("invite_page");

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
