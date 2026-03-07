import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function ProfileSettingsPage() {
  return (
    <Suspense>
      <ProfileSettingsContent />
    </Suspense>
  );
}

async function ProfileSettingsContent() {
  const supabase = await createClient();

  const [authRes, profileRes] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("*").single(),
  ]);

  const user = authRes.data.user;
  const profile = profileRes.data;

  if (!user) redirect(LINKS.login);

  return (
    <ProfileSettingsForm
      profile={profile}
      pendingEmail={user.new_email ?? null}
    />
  );
}
