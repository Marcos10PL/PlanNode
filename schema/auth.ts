import { z } from "zod";
import { createDefaultFields, Transalations } from "./defaults";

export const createLoginSchema = (t: Transalations) => {
  return z.object({
    email: createDefaultFields(t).email,
    password: createDefaultFields(t).password,
  });
};

export const createRegisterSchema = (t: Transalations) => {
  return z
    .object({
      email: createDefaultFields(t).email,
      password: createDefaultFields(t).password,
      confirmPassword: createDefaultFields(t).password,
    })
    .refine(data => data.password === data.confirmPassword, {
      message: t("passwords_do_not_match"),
      path: ["confirmPassword"],
    });
};

export const createForgotPasswordSchema = (t: Transalations) => {
  return z.object({
    email: createDefaultFields(t).email,
  });
};

export const createUpdatePasswordSchema = (t: Transalations) => {
  return z.object({
    password: createDefaultFields(t).password,
  });
};

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;
export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;
export type ForgotPasswordSchema = z.infer<
  ReturnType<typeof createForgotPasswordSchema>
>;
export type UpdatePasswordSchema = z.infer<
  ReturnType<typeof createUpdatePasswordSchema>
>;
