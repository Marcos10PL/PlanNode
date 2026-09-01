import { ProfileForm } from "@/components/profile/profile-form";
import { getOwnedWorkspacesWithOtherMembers } from "@/lib/data/workspaces";

export default async function ProfileSettingsPage() {
  const blockingWorkspaces = await getOwnedWorkspacesWithOtherMembers();

  return <ProfileForm blockingWorkspaces={blockingWorkspaces} />;
}
