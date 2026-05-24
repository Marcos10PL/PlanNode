import { AppConfig } from "@/types/entities";
import { cache } from "react";
import { createClient } from "../supabase/server";

export const getAppConfig = cache(async (): Promise<AppConfig> => {
  const supabase = await createClient();

  const { data } = await supabase.from("app_config").select("key, value");

  const config: Record<string, unknown> = {};

  for (const row of data ?? []) {
    config[row.key] = row.value;
  }

  return {
    max_workspaces_per_user: (config.max_workspaces_per_user as number) ?? 15,
  };
});
