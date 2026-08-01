"use client";

import { deleteTaskCommentAction } from "@/actions/task/delete-task-comment";
import { updateTaskCommentAction } from "@/actions/task/update-task-comment";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { EditButton } from "@/components/ui/edit-button";
import { Textarea } from "@/components/ui/textarea";
import UserAvatar from "@/components/user-avatar";
import { ERRORS, VALIDATION_MAX } from "@/const";
import { TaskComment } from "@/types/dto";
import { formatDate } from "@/utils";
import { useLocale, useTranslations } from "next-intl";
import { RefObject, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TaskEventAuthor } from "./task-event-author";

type Props = {
  comment: TaskComment;
  canManageComments: boolean;
  onChanged: () => Promise<void>;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
};

export function TaskCommentCard({
  comment,
  canManageComments,
  onChanged,
  scrollContainerRef,
}: Props) {
  const t = useTranslations("tasks.activity");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { user: currentUser } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const isAuthor = comment.user?.id === currentUser.id;
  const canDelete = isAuthor || canManageComments;
  const isEdited = comment.createdAt !== comment.updatedAt;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editText]);

  useLayoutEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current;
      el.focus({ preventScroll: true });
      const length = el.value.length;
      el.setSelectionRange(length, length);
    }
  }, [isEditing]);

  useLayoutEffect(() => {
    if (!isEditing || !cardRef.current || !scrollContainerRef.current) return;

    const cardRect = cardRef.current.getBoundingClientRect();
    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const overflowBottom = cardRect.bottom - containerRect.bottom;

    if (overflowBottom > 0) {
      scrollContainerRef.current.scrollTop += overflowBottom;
    }
  }, [isEditing, editText, scrollContainerRef]);

  const startEdit = () => {
    setEditText(comment.content);
    setIsEditing(true);
  };

  const handleSubmitEdit = async () => {
    const content = editText.trim();
    if (!content) return;

    setEditSubmitting(true);
    try {
      const result = await updateTaskCommentAction(comment.id, { content });
      if (result.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? tCommon("insufficient_role")
            : t("comment_error"),
        );
        return;
      }
      await onChanged();
      setIsEditing(false);
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteSubmitting(true);
    try {
      const result = await deleteTaskCommentAction(comment.id);
      if (result?.error) {
        toast.error(
          result.error === ERRORS.INSUFFICIENT_ROLE
            ? tCommon("insufficient_role")
            : t("comment_delete_error"),
        );
      } else {
        onChanged();
      }
    } catch {
      toast.error(tCommon("unexpected_error"));
    } finally {
      setDeleteSubmitting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <div ref={cardRef} className="flex gap-2">
      <div className="flex-1 min-w-0 rounded-lg border bg-muted/40 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 min-w-0 py-2 px-3">
          <UserAvatar
            name={comment.user?.fullName ?? t("unknown_user")}
            userId={comment.user?.id}
            className="h-7 w-7 shrink-0"
          />
          <div className="text-sm opacity-90 flex items-center gap-0.5 min-w-0">
            <TaskEventAuthor user={comment.user} />
          </div>
        </div>

        {isEditing ? (
          <div className="px-3 pb-2">
            <Textarea
              ref={textareaRef}
              value={editText}
              onChange={e => setEditText(e.target.value)}
              maxLength={VALIDATION_MAX.TASK_COMMENT}
              rows={1}
              className="border-none bg-transparent shadow-none px-1.5 py-1 min-h-0 overflow-hidden focus-visible:ring-0 text-sm -mx-1 -mb-1"
            />
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap px-3.5 pb-2 pt-1">
            {comment.content}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 mt-0.5 border-t px-3 py-1.5">
          {isEditing ? (
            <div className="flex gap-2 *:w-full md:*:w-auto md:justify-end w-full *:h-7">
              <Button
                variant="outline"
                size="sm"
                disabled={editSubmitting}
                onClick={() => setIsEditing(false)}
              >
                {t("comment_cancel")}
              </Button>
              <Button
                size="sm"
                disabled={editSubmitting || !editText.trim()}
                onClick={handleSubmitEdit}
              >
                {t("comment_save")}
              </Button>
            </div>
          ) : (
            <>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt, locale)}
                {isEdited && ` (${t("comment_edited")})`}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                {isAuthor && <EditButton onClick={startEdit} />}
                {canDelete && (
                  <DeleteButton onClick={() => setDeleteOpen(true)} />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={t("comment_delete_confirm_title")}
        description={t("comment_delete_confirm_description")}
        isPending={deleteSubmitting}
        variant="destructive"
      />
    </div>
  );
}
