"use server";

import { ERRORS, LINKS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { registerSchema, RegisterSchema } from "@/schema";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";

export async function signUpAction(data: RegisterSchema) {
  const parsed = registerSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const [locale, origin] = await Promise.all([
    getLocale(),
    headers().then(h => h.get("origin") ?? ""),
  ]);
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}${LINKS.dashboard}`,
      data: { full_name: parsed.data.full_name, locale },
    },
  });

  if (error) {
    if (error.code === "user_already_exists")
      return { error: ERRORS.userAlreadyExists };

    return { error: ERRORS.serverError };
  }

  return { success: true };
}
