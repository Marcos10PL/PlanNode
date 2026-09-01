import { INVITABLE_ROLES, VALIDATION_MAX } from "@/const";
import { Translations } from "@/types";
import { z } from "zod";
import { descriptionField, emailField, nameField } from "./defaults";

export const createWorkspaceSchema = (t?: Translations) =>
  z.object({
    name: nameField(VALIDATION_MAX.WORKSPACE_NAME, t),
    description: descriptionField(VALIDATION_MAX.WORKSPACE_DESCRIPTION, t),
  });

export const inviteMemberSchema = (t?: Translations) =>
  z.object({
    email: emailField(t),
    role: z.enum(INVITABLE_ROLES),
  });

export const updateMemberRoleSchema = () =>
  z.object({
    role: z.enum(INVITABLE_ROLES),
  });

export const updateWorkspaceSchema = (t?: Translations) =>
  z.object({
    name: nameField(VALIDATION_MAX.WORKSPACE_NAME, t),
    description: descriptionField(VALIDATION_MAX.WORKSPACE_DESCRIPTION, t),
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
