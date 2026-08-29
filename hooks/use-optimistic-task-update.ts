"use client";

import { updateTaskAction } from "@/actions/task/update-task";
import { ERRORS } from "@/const";
import { UpdateTaskSchema } from "@/schema";
import { Task } from "@/types/dto";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

export function useOptimisticTaskUpdate<T extends Task>(
  tasks: T[],
  setTasks: Dispatch<SetStateAction<T[]>>,
) {
  const tRoot = useTranslations();
  const router = useRouter();

  const updateTaskField = async (
    taskId: string,
    patch: Partial<Task>,
    serverPatch: UpdateTaskSchema,
    fallbackErrorKey: string,
  ) => {
    const previous = tasks;
    setTasks(prev =>
      prev.map(task => (task.id === taskId ? { ...task, ...patch } : task)),
    );

    try {
      const result = await updateTaskAction(taskId, serverPatch);
      if (result?.error) {
        setTasks(previous);
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? tRoot("common.insufficient_role")
            : result.error === ERRORS.INVALID_ASSIGNEE
              ? tRoot("tasks.invalid_assignee")
              : tRoot(fallbackErrorKey),
        );
        router.refresh();
      }
      return result;
    } catch {
      setTasks(previous);
      toast.error(tRoot("common.unexpected_error"));
      router.refresh();
    }
  };

  return updateTaskField;
}
