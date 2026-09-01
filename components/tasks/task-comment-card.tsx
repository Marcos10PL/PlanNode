"use client";

import { deleteTaskCommentAction } from "@/actions/task/delete-task-comment";
import { updateTaskCommentAction } from "@/actions/task/update-task-comment";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { DeleteButton } from "@/components/ui/delete-button";
import { EditButton } from "@/components/ui/edit-button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import UserAvatar from "@/components/user-avatar";
import { ERRORS, VALIDATION_MAX } from "@/const";
import { TaskComment } from "@/types/dto";
import { formatDate } from "@/utils";
import { isHtmlContentEmpty } from "@/utils/helpers";
import { useLocale, useTranslations } from "next-intl";
import { RefObject, useLayoutEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { TaskDescriptionView } from "./task-description-view";
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

  const cardRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isEditing || !cardRef.current || !scrollContainerRef.current) return;

    const adjust = () => {
      if (!cardRef.current || !scrollContainerRef.current) return;
      const cardRect = cardRef.current.getBoundingClientRect();
      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const overflowBottom = cardRect.bottom - containerRect.bottom;
      if (overflowBottom > 0) {
        scrollContainerRef.current.scrollTop += overflowBottom;
      }
    };

    adjust();
    const observer = new ResizeObserver(adjust);
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isEditing, scrollContainerRef]);

  const startEdit = () => {
    setEditText(comment.content);
    setIsEditing(true);
  };

  const handleSubmitEdit = async () => {
    if (isHtmlContentEmpty(editText)) return;

    setEditSubmitting(true);
    try {
      const result = await updateTaskCommentAction(comment.id, {
        content: editText,
      });
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
        await onChanged();
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
        {!isEditing && (
          <div className="flex items-center gap-2 min-w-0 pt-3 px-3">
            {comment.user && (
              <UserAvatar
                name={comment.user.fullName}
                userId={comment.user.id}
                className="h-7 w-7 shrink-0"
              />
            )}
            <div className="text-sm opacity-90 flex items-center gap-0.5 min-w-0">
              <TaskEventAuthor user={comment.user} />
            </div>
          </div>
        )}

        {isEditing ? (
          <div className="-mb-2">
            <RichTextEditor
              value={editText}
              onChange={setEditText}
              maxLength={VALIDATION_MAX.TASK_COMMENT}
              editorClassName="min-h-0"
              className="border-0 rounded-none"
              autoFocus
            />
          </div>
        ) : (
          <div className="px-3 pt-[0.2rem]">
            <TaskDescriptionView
              html={comment.content}
              className="max-h-64 overflow-y-auto"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-0.5 border-t px-3 py-1.5">
          {isEditing ? (
            <div className="flex gap-2 *:w-full md:*:w-auto md:justify-end w-full">
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                disabled={editSubmitting}
                onClick={() => setIsEditing(false)}
              >
                {t("comment_cancel")}
              </Button>
              <Button
                size="sm"
                className="h-7"
                disabled={editSubmitting || isHtmlContentEmpty(editText)}
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
