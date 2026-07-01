"use server";

import { COOKIES } from "@/const";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

const MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export async function setActiveWorkspaceAction(workspaceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const cookieStore = await cookies();

  cookieStore.set(COOKIES.ACTIVE_WORKSPACE_ID, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}
