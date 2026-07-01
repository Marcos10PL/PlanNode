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
      emailRedirectTo: `${origin}${LINKS.DASHBOARD}`,
    },
  });

  if (error) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
