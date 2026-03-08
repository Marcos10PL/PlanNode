import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { LINKS } from "@/const";
import { getProfile } from "@/lib/data";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function ProfileSettingsPage() {
  return (
    <Suspense>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await getProfile();

  if (!data) {
    redirect(LINKS.login);
  }

  const { profile, user } = data;

  return (
    <ProfileSettingsForm
      profile={profile}
      pendingEmail={user?.new_email ?? null}
    />
  );
}
