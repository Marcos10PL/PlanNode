import { AppConfig } from "@/types/dto";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getAppConfig = cache(async () => {
  const supabase = await createClient();

  const { data } = await supabase.from("app_config").select("key, value");

  const config: Record<string, unknown> = {};

  for (const row of data ?? []) {
    config[row.key] = row.value;
  }

  return {
    maxWorkspacesPerUser: Number(config.max_workspaces_per_user ?? 15),
  } satisfies AppConfig;
});
