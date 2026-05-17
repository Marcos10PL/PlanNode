import z from "zod";

export type Translations = (key: string) => string;

export const defaultFields = (t?: Translations) => {
  return {
    email: z.email(t?.("invalid_email")),
    password: z.string().min(6, t?.("password_too_short")),
    full_name: z.string().min(1, t?.("full_name_required")).max(255),
  };
};
