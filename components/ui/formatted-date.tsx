"use client";

import { formatDate } from "@/utils/formatters";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

// avoids calling setState in an effect
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

type Props = {
  value: string | null;
  locale: string;
};

// defers local-timezone formatting to avoid a hydration mismatch
export function FormattedDate({ value, locale }: Props) {
  const isClient = useIsClient();

  return <>{isClient ? formatDate(value, locale) : "--"}</>;
}
