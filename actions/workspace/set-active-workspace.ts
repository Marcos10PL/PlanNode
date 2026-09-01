"use server";

import { COOKIES, ERRORS } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function setActiveWorkspaceAction(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: ERRORS.UNAUTHENTICATED };

  const { data: member, error } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("id", user.id)
    .maybeSingle();

  if (error) return { error: ERRORS.SERVER_ERROR };
  if (!member) return { error: ERRORS.UNAUTHORIZED };

  const cookieStore = await cookies();

  cookieStore.set(COOKIES.ACTIVE_WORKSPACE_ID, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });

  return { success: true };
}
