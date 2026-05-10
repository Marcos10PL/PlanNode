import z from "zod";

export type Transalations = (key: string) => string;

export const defaultFields = (t?: Transalations) => {
  return {
    email: z.email(t?.("invalid_email")),
    password: z.string().min(6, t?.("password_too_short")),
    full_name: z.string().min(1, t?.("full_name_required")).max(255),
  };
};
