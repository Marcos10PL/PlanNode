import { LINKS } from "@/const";
import { Profile } from "@/types/dto";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getProfile = cache(async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LINKS.LOGIN);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || error) redirect(LINKS.LOGIN);

  return {
    profile: {
      id: profile.id,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      fullName: profile.full_name,
      email: profile.email,
      locale: profile.locale,
      role: profile.role,
    } satisfies Profile,
    user,
  };
});
