import { VALIDATION_MAX, WORKSPACE_ROLES } from "@/const";
import { Translations } from "@/types";
import { z } from "zod";
import { descriptionField, emailField, nameField } from "./defaults";

export const createWorkspaceSchema = (t?: Translations) =>
  z.object({
    name: nameField(VALIDATION_MAX.WORKSPACE_NAME, t),
    description: descriptionField(VALIDATION_MAX.WORKSPACE_DESCRIPTION),
  });

export const inviteMemberSchema = (t?: Translations) =>
  z.object({
    email: emailField(t),
    role: z.enum(WORKSPACE_ROLES),
  });

export const updateMemberRoleSchema = () =>
  z.object({
    role: z.enum(WORKSPACE_ROLES),
  });

export const updateWorkspaceSchema = (t?: Translations) =>
  z.object({
    name: nameField(VALIDATION_MAX.WORKSPACE_NAME, t),
    description: descriptionField(VALIDATION_MAX.WORKSPACE_DESCRIPTION),
  });

export type CreateWorkspaceSchema = z.infer<
  ReturnType<typeof createWorkspaceSchema>
>;
export type InviteMemberSchema = z.infer<ReturnType<typeof inviteMemberSchema>>;
export type UpdateMemberRoleSchema = z.infer<
  ReturnType<typeof updateMemberRoleSchema>
>;
export type UpdateWorkspaceSchema = z.infer<
  ReturnType<typeof updateWorkspaceSchema>
>;
