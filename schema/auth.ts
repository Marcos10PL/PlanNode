import { z } from "zod";
import { defaultFields, Transalations } from "./defaults";

export const loginSchema = (t?: Transalations) => {
  return z.object({
    email: defaultFields(t).email,
    password: defaultFields(t).password,
  });
};

export const registerSchema = (t?: Transalations) => {
  return z
    .object({
      full_name: defaultFields(t).full_name,
      email: defaultFields(t).email,
      password: defaultFields(t).password,
      confirmPassword: defaultFields(t).password,
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t?.("passwords_do_not_match") ?? "passwords_do_not_match",
      path: ["confirmPassword"],
    });
};

export const forgotPasswordSchema = (t?: Transalations) => {
  return z.object({
    email: defaultFields(t).email,
  });
};

export type LoginSchema = z.infer<ReturnType<typeof loginSchema>>;
export type RegisterSchema = z.infer<ReturnType<typeof registerSchema>>;
export type ForgotPasswordSchema = z.infer<ReturnType<typeof forgotPasswordSchema>>;
