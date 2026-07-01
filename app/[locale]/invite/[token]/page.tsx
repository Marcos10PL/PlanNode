import { Actions } from "@/components/invite/actions";
import { Layout } from "@/components/invite/layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInvitationByToken, getProfile } from "@/lib/data";
import { getRoleLabel, getRoleVariant } from "@/utils";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const t = await getTranslations("invite_page");
  const tTeam = await getTranslations();

  const { profile } = await getProfile();
  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return (
      <Layout>
        <p className="text-sm text-muted-foreground">{t("error_not_found")}</p>
      </Layout>
    );
  }

  if (new Date(invitation.expiresAt) < new Date()) {
    return (
      <Layout>
        <p className="text-sm text-muted-foreground">{t("error_expired")}</p>
      </Layout>
    );
  }

  if (profile.email !== invitation.email) {
    return (
      <Layout>
        <p className="text-sm text-muted-foreground">
          {t("error_email_mismatch")}
        </p>
      </Layout>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div>
            {invitation.inviterName && (
              <p className="text-sm text-muted-foreground">
                {t("invited_by", { name: invitation.inviterName })}
                <span className="text-sm dark:text-white text-black font-semibold mt-1 ml-1">
                  {invitation.workspaceName}
                </span>
              </p>
            )}
          </div>
          <div className="flex gap-2 items-center mb-4">
            <p className="text-sm text-muted-foreground">{t("role_label")}</p>
            <Badge
              variant={getRoleVariant(invitation.role!)}
              className="shrink-0 pointer-events-none"
            >
              {getRoleLabel(invitation.role!, tTeam)}
            </Badge>
          </div>
          <Actions token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
