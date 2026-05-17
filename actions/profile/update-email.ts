"use server";

import { createClient } from "@/lib/supabase/server";
import { updateEmailSchema, UpdateEmailSchema } from "@/schema";
import { ERRORS } from "@/const";

export async function updateEmailAction(data: UpdateEmailSchema) {
  const parsed = updateEmailSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.invalidData };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.unauthorized };

  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
  });

  if (error) return { error: ERRORS.serverError };

  return { success: true };
}
