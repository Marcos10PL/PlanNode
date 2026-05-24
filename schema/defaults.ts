import { VALIDATION_MAX } from "@/const";
import { Translations } from "@/types"
import z from "zod";

export const emailField = (t?: Translations) => z.email(t?.("invalid_email"));

export const passwordField = (t?: Translations) =>
  z.string().min(6, t?.("password_too_short"));

export const fullNameField = (t?: Translations) =>
  z
    .string()
    .trim()
    .min(1, t?.("full_name_required"))
    .max(VALIDATION_MAX.FULL_NAME);

export const nameField = (max: number, t?: Translations) =>
  z.string().trim().min(1, t?.("field_required")).max(max);

export const descriptionField = (max: number) => z.string().trim().max(max);
