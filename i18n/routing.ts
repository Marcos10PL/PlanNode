import { defineRouting } from "next-intl/routing";

export const LOCALES = {
  EN: "en",
  PL: "pl",
} as const;

export const routing = defineRouting({
  locales: Object.values(LOCALES),

  defaultLocale: LOCALES.EN,
});
