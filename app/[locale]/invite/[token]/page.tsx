import { acceptInvitationAction } from "@/actions/workspace/accept-invitation";
import { declineInvitationAction } from "@/actions/workspace/decline-invitation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LINKS } from "@/const";
import { getRoleLabel } from "@/utils";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; token: string }>;
};

export default async function InvitePage({ params }: Props) {
  const { locale, token } = await params;
  const t = await getTranslations("invite_page");
  const tTeam = await getTranslations();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}${LINKS.login}`);
  }

  const { data: invitation } = await supabase
    .from("workspace_invitations")
    .select("*, workspace:workspaces(name)")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (!invitation) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("error_not_found")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("error_expired")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (profile?.email !== invitation.email) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t("error_email_mismatch")}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const workspaceName = (invitation.workspace as { name: string } | null)?.name ?? "";

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t("invited_by", { name: invitation.email })}</p>
            <p className="text-lg font-semibold mt-1">{workspaceName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{t("role_label")}</p>
            <p className="text-sm font-medium">{getRoleLabel(invitation.role, tTeam)}</p>
          </div>
          <div className="flex gap-2">
            <form
              action={async () => {
                "use server";
                await acceptInvitationAction(token);
              }}
              className="flex-1"
            >
              <Button type="submit" className="w-full">
                {t("accept")}
              </Button>
            </form>
            <form
              action={async () => {
                "use server";
                await declineInvitationAction(token);
              }}
              className="flex-1"
            >
              <Button type="submit" variant="outline" className="w-full">
                {t("decline")}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
