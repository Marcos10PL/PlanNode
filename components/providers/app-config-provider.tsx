"use client";

import { AppConfig } from "@/types/entities";
import { createContext, useContext } from "react";

const AppConfigContext = createContext<AppConfig | null>(null);

export function AppConfigProvider({
  config,
  children,
}: {
  config: AppConfig;
  children: React.ReactNode;
}) {
  return <AppConfigContext value={config}>{children}</AppConfigContext>;
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context)
    throw new Error("useAppConfig must be used within AppConfigProvider");
  return context;
}
