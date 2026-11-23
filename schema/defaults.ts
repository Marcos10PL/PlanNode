import { VALIDATION_MAX, VALIDATION_MIN } from "@/const";
import { Translations } from "@/types";
import { getHtmlTextLength } from "@/utils/helpers";
import z from "zod";

export const emailField = (t?: Translations) =>
  z.email(t?.("invalid_email")).max(VALIDATION_MAX.EMAIL);

export const passwordField = (t?: Translations) =>
  z.string().min(6, t?.("password_too_short"));

export const fullNameField = (t?: Translations) =>
  z
    .string()
    .trim()
    .min(VALIDATION_MIN.NAME, t?.("full_name_required"))
    .max(VALIDATION_MAX.FULL_NAME, t?.("field_too_long"));

export const nameField = (max: number, t?: Translations) =>
  z
    .string()
    .trim()
    .min(VALIDATION_MIN.NAME, t?.("field_required"))
    .max(max, t?.("field_too_long"));

export const descriptionField = (max: number, t?: Translations) =>
  z.string().trim().max(max, t?.("field_too_long"));

export const htmlContentField = (
  max: number,
  maxHtml: number,
  t?: Translations,
) =>
  z
    .string()
    .refine(val => getHtmlTextLength(val) <= max, t?.("field_too_long"))
    .refine(val => val.length <= maxHtml, t?.("field_too_long"));
