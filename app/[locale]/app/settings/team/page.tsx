import { SubHeader } from "@/components/sub-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { InviteMemberForm } from "@/components/workspaces/team/elements/invite-member-form";
import { MemberList } from "@/components/workspaces/team/member-list";
import { PendingInvitationsList } from "@/components/workspaces/team/pending-invitations-list";
import { COOKIES } from "@/const";
import { getWorkspaceContext, getWorkspaceInvitations } from "@/lib/data";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export default async function TeamPage() {
  const t = await getTranslations("team");

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.ACTIVE_WORKSPACE_ID)?.value;

  if (!activeWorkspaceId) {
    return (
      <div className="mt-6">
        <NoWorkspaceBanner />
      </div>
    );
  }

  const [{ user, members, role, canManage }, invitations] = await Promise.all([
    getWorkspaceContext(activeWorkspaceId),
    getWorkspaceInvitations(activeWorkspaceId),
  ]);

  const ACCORDION_VALUES = {
    MEMBERS: "members",
    INVITATIONS: "invitations",
  };

  const values = [ACCORDION_VALUES.MEMBERS];
  if (canManage) values.push(ACCORDION_VALUES.INVITATIONS);

  return (
    <>
      <SubHeader title={t("title")} description={t("workspace_context")} />

      <div className="flex flex-col gap-4">
        {canManage && <InviteMemberForm workspaceId={activeWorkspaceId} />}

        <Accordion type="multiple" defaultValue={values}>
          <AccordionItem
            value={ACCORDION_VALUES.MEMBERS}
            disabled={!canManage} // for better UX - only one section, no accordion needed
          >
            <AccordionTrigger
              className={"disabled:opacity-100! disabled:[&>svg]:hidden"}
            >
              {t("members_section")} ({members.length})
            </AccordionTrigger>
            <AccordionContent>
              <MemberList
                members={members}
                currentUserId={user?.id ?? ""}
                currentUserRole={role}
                workspaceId={activeWorkspaceId}
              />
            </AccordionContent>
          </AccordionItem>

          {canManage && (
            <AccordionItem value={ACCORDION_VALUES.INVITATIONS}>
              <AccordionTrigger>
                {t("invitations_section")} ({invitations.length})
              </AccordionTrigger>
              <AccordionContent>
                <PendingInvitationsList invitations={invitations} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </>
  );
}
