"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function resendConfirmationAction(email: string) {
  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${origin}${LINKS.dashboard}`,
    },
  });

  if (error) return { error: ERRORS.serverError };

  return { success: true };
}
