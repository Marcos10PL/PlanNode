"use client";

import { createTaskCommentAction } from "@/actions/task/create-task-comment";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ERRORS, VALIDATION_MAX } from "@/const";
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
    const content = commentText.trim();
    if (!content) return;

    setSubmitting(true);
    try {
      const result = await createTaskCommentAction(taskId, { content });
      if (result.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? tCommon("insufficient_role")
            : t("comment_error"),
        );
        return;
      }
      setCommentText("");
      onChanged();
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2 pt-2 border-t">
      <Textarea
        value={commentText}
        onChange={e => setCommentText(e.target.value)}
        placeholder={t("comment_placeholder")}
        maxLength={VALIDATION_MAX.TASK_COMMENT}
        rows={2}
      />
      <Button
        size="sm"
        disabled={submitting || !commentText.trim()}
        onClick={handleSubmit}
        className="shrink-0 w-full"
      >
        {submitting ? t("comment_submitting") : t("comment_submit")}
      </Button>
    </div>
  );
}
