import { LINKS } from "@/const";
import { Database } from "@/types/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {}
        },
      },
    },
  );
}

type Client = Awaited<ReturnType<typeof createClient>>;

export async function getUserContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function requireUserContext() {
  const { supabase, user } = await getUserContext();

  if (!user) redirect(LINKS.LOGIN);

  return { supabase, user };
}

export async function canEditProject(
  supabase: Client,
  projectId: string,
  userId: string,
) {
  const { data } = await supabase.rpc("can_edit_project", {
    p_project_id: projectId,
    p_user_id: userId,
  });

  return !!data;
}

export async function isProjectManager(
  supabase: Client,
  projectId: string,
  userId: string,
) {
  const { data } = await supabase.rpc("is_project_manager", {
    p_project_id: projectId,
    p_user_id: userId,
  });

  return !!data;
}
