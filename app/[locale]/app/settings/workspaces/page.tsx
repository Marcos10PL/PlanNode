"use client";

import { useAppConfig } from "@/components/providers/app-config-provider";
import { useUser } from "@/components/providers/user-provider";
import { useWorkspaces } from "@/components/providers/workspace-provider";
import { SubHeader } from "@/components/sub-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CreateWorkspaceModal } from "@/components/workspaces/create-workspace-modal";
import { WorkspaceItem } from "@/components/workspaces/elements/workspace-item";
import { NoWorkspaceBanner } from "@/components/workspaces/no-workspace-banner";
import { useTranslations } from "next-intl";

export default function ProfileWorkspacesPage() {
  const t = useTranslations("profile_workspaces");
  const { workspaces } = useWorkspaces();
  const { maxWorkspacesPerUser } = useAppConfig();
  const { user } = useUser();

  const myWorkspaces = workspaces.filter(w => w.ownerId === user?.id);
  const sharedWorkspaces = workspaces.filter(w => w.ownerId !== user?.id);

  const isShared = sharedWorkspaces.length > 0;

  const myLabelCount = ` (${myWorkspaces.length}/${maxWorkspacesPerUser})`;
  const sharedLabelCount = ` (${sharedWorkspaces.length})`;

  const isReached = myWorkspaces.length >= maxWorkspacesPerUser;

  const ACCORDION_VALUES = {
    MY: {
      value: "my",
      label: `${t("my_workspaces")} ${myLabelCount}`,
      items: myWorkspaces,
    },
    SHARED: {
      value: "shared",
      label: `${t("shared_workspaces")} ${sharedLabelCount}`,
      items: sharedWorkspaces,
    },
  };

  const defaultValues = [
    ACCORDION_VALUES.MY.value,
    ACCORDION_VALUES.SHARED.value,
  ];

  return (
    <>
      <div className="flex flex-col! md:flex-row! md:items-center gap-x-8 justify-between">
        <SubHeader
          title={t("title")}
          description={`${t("description")} ${isShared ? "" : myLabelCount}`}
        />
        {!isReached && <CreateWorkspaceModal />}
      </div>

      {workspaces.length === 0 ? (
        <div className="mt-12">
          <NoWorkspaceBanner />
        </div>
      ) : isShared ? (
        <Accordion type="multiple" defaultValue={defaultValues}>
          {Object.values(ACCORDION_VALUES).map(section => (
            <AccordionItem key={section.value} value={section.value}>
              <AccordionTrigger>{section.label}</AccordionTrigger>
              <AccordionContent>
                <Layout>
                  {section.items.map(workspace => (
                    <WorkspaceItem key={workspace.id} workspace={workspace} />
                  ))}
                </Layout>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Layout>
          {myWorkspaces.map(workspace => (
            <WorkspaceItem key={workspace.id} workspace={workspace} />
          ))}
        </Layout>
      )}
    </>
  );
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-full overflow-hidden mt-4 md:mt-0">
      {children}
    </div>
  );
};
