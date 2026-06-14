"use client";

import { Profile } from "@/types/dto";
import { User } from "@supabase/supabase-js";
import { createContext, useContext } from "react";

type UserContextValue = {
  profile: Profile;
  user: User;
};

type UserProviderProps = {
  profile: Profile;
  user: User;
  children: React.ReactNode;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ profile, user, children }: UserProviderProps) {
  return <UserContext value={{ profile, user }}>{children}</UserContext>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within UserProvider");
  return context;
}
