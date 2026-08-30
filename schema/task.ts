import { TASK_PRIORITIES, TASK_STATUSES, VALIDATION_MAX } from "@/const";
import { Translations } from "@/types";
import { getHtmlTextLength, isHtmlContentEmpty } from "@/utils/helpers";
import { z } from "zod";
import { htmlContentField, nameField } from "./defaults";

export const createTaskListSchema = (t?: Translations) =>
  z.object({
    name: nameField(VALIDATION_MAX.TASK_LIST_NAME, t),
  });

export const createTaskSchema = (t?: Translations) =>
  z.object({
    title: nameField(VALIDATION_MAX.TASK_TITLE, t),
    description: htmlContentField(VALIDATION_MAX.TASK_DESCRIPTION, t),
    status: z.enum(TASK_STATUSES),
    priority: z.enum(TASK_PRIORITIES),
    assigneeId: z.uuid().nullable(),
    dueDate: z.iso.date().nullable(),
  });

export const updateTaskSchema = (t?: Translations) =>
  createTaskSchema(t).partial();

export const createTaskCommentSchema = (t?: Translations) =>
  z.object({
    content: z
      .string()
      .refine(val => !isHtmlContentEmpty(val), t?.("field_required"))
      .refine(
        val => getHtmlTextLength(val) <= VALIDATION_MAX.TASK_COMMENT,
        t?.("field_too_long"),
      ),
  });

export type CreateTaskListSchema = z.infer<
  ReturnType<typeof createTaskListSchema>
>;
export type CreateTaskSchema = z.infer<ReturnType<typeof createTaskSchema>>;
export type UpdateTaskSchema = z.infer<ReturnType<typeof updateTaskSchema>>;
export type CreateTaskCommentSchema = z.infer<
  ReturnType<typeof createTaskCommentSchema>
>;
