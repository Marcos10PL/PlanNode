"use client";

import { useState } from "react";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function useCookieState<T>(name: string, defaultValue: T) {
  const [value, setValue] = useState(defaultValue);

  const setPersisted = (next: T | ((prev: T) => T)) => {
    setValue(prev => {
      const resolved = next instanceof Function ? next(prev) : next;
      document.cookie = `${name}=${encodeURIComponent(JSON.stringify(resolved))}; path=/; max-age=${COOKIE_MAX_AGE}`;
      return resolved;
    });
  };

  return [value, setPersisted] as const;
}
