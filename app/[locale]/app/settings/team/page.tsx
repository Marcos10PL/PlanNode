import { SettingsHeader } from "@/components/settings/settings-header";
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
import { COOKIES, WORKSPACE_ROLES } from "@/const";
import {
  getWorkspaceInvitations,
  getWorkspaceMembers,
  getWorkspaces,
} from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";

export default async function TeamPage() {
  const t = await getTranslations("team");

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get(COOKIES.activeWorkspaceId)?.value;

  if (!activeWorkspaceId) {
    return (
      <div className="mt-6">
        <NoWorkspaceBanner />
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [workspaces, members, invitations] = await Promise.all([
    getWorkspaces(),
    getWorkspaceMembers(activeWorkspaceId),
    getWorkspaceInvitations(activeWorkspaceId),
  ]);

  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  const currentMember = members.find(m => m.id === user?.id);

  const currentUserRole = currentMember?.role ?? WORKSPACE_ROLES.MEMBER;

  const isAdminOrOwner =
    currentUserRole === WORKSPACE_ROLES.OWNER ||
    currentUserRole === WORKSPACE_ROLES.ADMIN;

  const ACCORDION_VALUES = {
    MEMBERS: "members",
    INVITATIONS: "invitations",
  };

  const values = [ACCORDION_VALUES.MEMBERS];
  if (isAdminOrOwner) values.push(ACCORDION_VALUES.INVITATIONS);

  return (
    <>
      <SettingsHeader
        title={t("title")}
        description={t("workspace_context", { name: workspace?.name ?? "" })}
        className="mt-4 mb-6"
      />

      <div className="flex flex-col gap-4">
        {isAdminOrOwner && <InviteMemberForm workspaceId={activeWorkspaceId} />}

        <Accordion type="multiple" defaultValue={values}>
          <AccordionItem
            value={ACCORDION_VALUES.MEMBERS}
            disabled={!isAdminOrOwner} // for better UX - only one section, no accordion needed
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
                currentUserRole={currentUserRole}
                workspaceId={activeWorkspaceId}
              />
            </AccordionContent>
          </AccordionItem>
          {isAdminOrOwner && (
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
