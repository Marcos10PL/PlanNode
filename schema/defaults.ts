import z from "zod";

export type Transalations = (key: string) => string;

export const createDefaultFields = (t: Transalations) => {
  return {
    email: z.email(t("invalid_email")),
    password: z.string().min(6, t("password_too_short")),
  };
};
