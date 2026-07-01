"use server";

import { ERRORS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { updateEmailSchema, UpdateEmailSchema } from "@/schema";

export async function updateEmailAction(data: UpdateEmailSchema) {
  const parsed = updateEmailSchema().safeParse(data);
  if (!parsed.success) return { error: ERRORS.INVALID_DATA };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
  });

  if (error) return { error: ERRORS.SERVER_ERROR };

  return { success: true };
}
