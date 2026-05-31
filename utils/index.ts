import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isActivePath(pathname: string, href: string) {
  const clean = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return clean === href;
}

export * from "./formatters";
export * from "./workspace";