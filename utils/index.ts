import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isActivePath(pathname: string, href: string) {
  const clean = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return clean === href;
}

export function isActiveSubPath(pathname: string, href: string) {
  const clean = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  return clean === href || clean.startsWith(`${href}/`);
}

export * from "./formatters";
export * from "./task";
export * from "./workspace";
