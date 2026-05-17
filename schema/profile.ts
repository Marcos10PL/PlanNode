import { z } from "zod";
import {
  emailField,
  passwordField,
  fullNameField,
  type Translations,
} from "./defaults";

export const profileAccountSchema = (t?: Translations) =>
  z.object({
    full_name: fullNameField(t),
  });

export const updateEmailSchema = (t?: Translations) =>
  z.object({
    email: emailField(t),
  });

export const updatePasswordSchema = (t?: Translations) =>
  z
    .object({
      password: passwordField(t),
      confirmPassword: passwordField(t),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t?.("passwords_do_not_match"),
      path: ["confirmPassword"],
    });

export const profileSettingsSchema = (t?: Translations) =>
  z
    .object({
      full_name: fullNameField(t),
      email: emailField(t),
      password: z.union([passwordField(t), z.literal("")]),
      confirmPassword: z.string(),
    })
    .refine(data => !data.password || data.password === data.confirmPassword, {
      message: t?.("passwords_do_not_match"),
      path: ["confirmPassword"],
    });

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
