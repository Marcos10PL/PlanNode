import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isActivePath(pathname: string, href: string) {
  const clean = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return clean === href;
}

export function formatDate(value: string | null, locale: string) {
  if (!value) return "--";

  const parsed = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

  return parsed.toLocaleString();
}
