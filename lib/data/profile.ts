import { Profile } from "@/types/entities";
import { createClient } from "../supabase/server";
import { cacheTag } from "next/cache";
import { User } from "@supabase/supabase-js";

export const getProfile = async (): Promise<{
  profile: Profile;
  user: User;
} | null> => {
  "use cache: private";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  cacheTag(`profile-${user.id}`);

  return { profile, user };
};
