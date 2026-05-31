"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, ForgotPasswordSchema } from "@/schema";
import { headers } from "next/headers";

export async function forgotPasswordAction(data: ForgotPasswordSchema) {
  const parsed = forgotPasswordSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${origin}${LINKS.updatePassword}`,
    },
  );

  if (error) return { error: ERRORS.serverError };

  return { success: true };
}
