"use server";

import { cookies } from "next/headers";
import { COOKIES } from "@/const";

export async function setActiveWorkspaceAction(workspaceId: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIES.activeWorkspaceId, workspaceId, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
