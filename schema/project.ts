import { VALIDATION_MAX } from "@/const";
import { Translations } from "@/types";
import { z } from "zod";
import { descriptionField, nameField } from "./defaults";

export const createProjectSchema = (t?: Translations) =>
  z.object({
    name: nameField(VALIDATION_MAX.PROJECT_NAME, t),
    description: descriptionField(VALIDATION_MAX.PROJECT_DESCRIPTION),
    isPrivate: z.boolean(),
  });

export const updateProjectSchema = createProjectSchema;

export const updateProjectMembersSchema = () =>
  z.object({
    memberIds: z.array(z.uuid()),
  });

export type CreateProjectSchema = z.infer<
  ReturnType<typeof createProjectSchema>
>;
export type UpdateProjectSchema = z.infer<
  ReturnType<typeof updateProjectSchema>
>;
export type UpdateProjectMembersSchema = z.infer<
  ReturnType<typeof updateProjectMembersSchema>
>;
