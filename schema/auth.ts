import { z } from "zod";
import { emailField, passwordField, fullNameField, Translations } from "./defaults";

export const loginSchema = (t?: Translations) => {
  return z.object({
    email: emailField(t),
    password: passwordField(t),
  });
};

export const registerSchema = (t?: Translations) => {
  return z
    .object({
      full_name: fullNameField(t),
      email: emailField(t),
      password: passwordField(t),
      confirmPassword: passwordField(t),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t?.("passwords_do_not_match") ?? "passwords_do_not_match",
      path: ["confirmPassword"],
    });
};

export const forgotPasswordSchema = (t?: Translations) => {
  return z.object({
    email: emailField(t),
  });
};

export type LoginSchema = z.infer<ReturnType<typeof loginSchema>>;
export type RegisterSchema = z.infer<ReturnType<typeof registerSchema>>;
export type ForgotPasswordSchema = z.infer<
  ReturnType<typeof forgotPasswordSchema>
>;
