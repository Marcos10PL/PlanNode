import { cache } from "react";
import { Profile } from "@/types/entities";
import { createClient } from "../supabase/server";
import { User } from "@supabase/supabase-js";

export const getProfile = cache(async (): Promise<{
  profile: Profile;
  user: User;
}> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { profile, user };
});
