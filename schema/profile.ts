import { z } from "zod";
import { defaultFields, type Translations } from "./defaults";

export const profileAccountSchema = (t?: Translations) =>
  z.object({
    full_name: defaultFields(t).full_name,
  });

export const updateEmailSchema = (t?: Translations) =>
  z.object({
    email: defaultFields(t).email,
  });

export const updatePasswordSchema = (t?: Translations) =>
  z
    .object({
      password: defaultFields(t).password,
      confirmPassword: defaultFields(t).password,
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t?.("passwords_do_not_match") ?? "passwords_do_not_match",
      path: ["confirmPassword"],
    });

export const profileSettingsSchema = (t?: Translations) => {
  const fields = defaultFields(t);
  return z
    .object({
      full_name: fields.full_name,
      email: fields.email,
      password: z.union([fields.password, z.literal("")]),
      confirmPassword: z.string(),
    })
    .refine(data => !data.password || data.password === data.confirmPassword, {
      message: t?.("passwords_do_not_match") ?? "passwords_do_not_match",
      path: ["confirmPassword"],
    });
};

export type ProfileAccountSchema = z.infer<
  ReturnType<typeof profileAccountSchema>
>;
export type UpdateEmailSchema = z.infer<ReturnType<typeof updateEmailSchema>>;
export type UpdatePasswordSchema = z.infer<
  ReturnType<typeof updatePasswordSchema>
>;
export type ProfileSettingsSchema = z.infer<
  ReturnType<typeof profileSettingsSchema>
>;
