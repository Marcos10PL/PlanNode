"use client";

import { createTaskCommentAction } from "@/actions/task/create-task-comment";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ERRORS, VALIDATION_MAX } from "@/const";
import { isHtmlContentEmpty } from "@/utils/helpers";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  taskId: string;
  onChanged: () => Promise<void>;
};

export function TaskCommentComposer({ taskId, onChanged }: Props) {
  const t = useTranslations("tasks.activity");
  const tCommon = useTranslations("common");

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isHtmlContentEmpty(commentText)) return;

    setSubmitting(true);
    try {
      const result = await createTaskCommentAction(taskId, {
        content: commentText,
      });
      if (result.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? tCommon("insufficient_role")
            : t("comment_error"),
        );
        return;
      }
      setCommentText("");
      await onChanged();
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 pt-2 border-t">
      <RichTextEditor
        value={commentText}
        onChange={setCommentText}
        placeholder={t("comment_placeholder")}
        maxLength={VALIDATION_MAX.TASK_COMMENT}
        className="w-full"
      />
      <Button
        size="sm"
        disabled={submitting || isHtmlContentEmpty(commentText)}
        onClick={handleSubmit}
        className="shrink-0 w-full"
      >
        {submitting ? t("comment_submitting") : t("comment_submit")}
      </Button>
    </div>
  );
}
