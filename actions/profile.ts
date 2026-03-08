"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ProfileAccountSchema } from "@/schema";

export async function updateProfileAction(data: ProfileAccountSchema) {
  const supabase = await createClient();

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: data.full_name || null })
    .eq("id", 44);

  if (profileError)
    return {
      error: true,
      message: "Profile update failed",
    };

  // const authPayload: { email?: string; password?: string } = {};
  // if (data.new_email) authPayload.email = data.new_email;
  // if (data.new_password) authPayload.password = data.new_password;

  // if (Object.keys(authPayload).length > 0) {
  //   const { error: authError } = await supabase.auth.updateUser(authPayload);
  //   if (authError) return { error: "Auth update failed" };
  // }

  // revalidatePath("/app/profile/settings");

  return {
    success: true,
    message: "Profile updated successfully",
  };
}
