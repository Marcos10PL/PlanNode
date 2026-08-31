"use client";

import { cn } from "@/utils";
import CharacterCount from "@tiptap/extension-character-count";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Popover as PopoverPrimitive } from "radix-ui";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Toggle } from "./toggle";

const ALLOWED_LINK_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  editorClassName?: string;
  autoFocus?: boolean;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  disabled,
  className,
  editorClassName = "min-h-24",
  autoFocus = false,
}: Props) {
  const t = useTranslations("common");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [, forceRerender] = useState(0);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        code: false,
        strike: false,
        link: false,
      }),
      Link.configure({
        openOnClick: true,
        autolink: true,
        protocols: ["mailto", "tel"],
      }),
      Placeholder.configure({ placeholder }),
      ...(maxLength ? [CharacterCount.configure({ limit: maxLength })] : []),
    ],
    content: value,
    editable: !disabled,
    autofocus: autoFocus ? "end" : false,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onTransaction: () => forceRerender(n => n + 1),
    editorProps: {
      attributes: {
        class: cn(
          "wrap-break-word tiptap max-h-64 overflow-y-auto px-3 py-2 text-sm focus:outline-none [&_p]:my-1 [&_p]:min-h-[1.25em] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-primary [&_a]:underline",
          editorClassName,
        ),
      },
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor || editor.isFocused) return;
    if (value === editor.getHTML()) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  const openLinkPopover = () => {
    setLinkValue(editor.getAttributes("link").href ?? "");
    setLinkError(false);
    setLinkPopoverOpen(true);
  };

  const applyLink = () => {
    const trimmed = linkValue.trim();

    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkPopoverOpen(false);
      return;
    }

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      setLinkError(true);
      return;
    }

    if (!ALLOWED_LINK_PROTOCOLS.includes(parsed.protocol)) {
      setLinkError(true);
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmed })
      .run();
    setLinkPopoverOpen(false);
  };

  const characters = editor.storage.characterCount?.characters();

  return (
    <div
      ref={wrapperRef}
      className={cn(
        "min-w-0 rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 dark:bg-input/30",
        className,
      )}
    >
      {!disabled && (
        <div className="flex items-center gap-1 border-b border-input p-1 *:cursor-pointer">
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
            aria-label="Bold"
          >
            <Bold />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
            aria-label="Italic"
          >
            <Italic />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            disabled={disabled}
            aria-label="Bullet list"
          >
            <List />
          </Toggle>
          <Toggle
            type="button"
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            disabled={disabled}
            aria-label="Ordered list"
          >
            <ListOrdered />
          </Toggle>

          <PopoverPrimitive.Root
            open={linkPopoverOpen}
            onOpenChange={open =>
              open ? openLinkPopover() : setLinkPopoverOpen(false)
            }
          >
            <PopoverPrimitive.Trigger asChild>
              <Toggle
                type="button"
                size="sm"
                pressed={editor.isActive("link") || linkPopoverOpen}
                disabled={disabled}
                aria-label="Link"
              >
                <LinkIcon />
              </Toggle>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal container={wrapperRef.current}>
              <PopoverPrimitive.Content
                align="start"
                sideOffset={4}
                className="z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-hidden data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
              >
                <div className="flex gap-2">
                  <Input
                    autoFocus
                    type="url"
                    placeholder={t("editor_link_placeholder")}
                    value={linkValue}
                    onChange={e => {
                      setLinkValue(e.target.value);
                      setLinkError(false);
                    }}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyLink();
                      }
                    }}
                    aria-invalid={linkError}
                    className="h-8"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="shrink-0"
                    onClick={applyLink}
                  >
                    {editor.isActive("link")
                      ? t("editor_link_save")
                      : t("editor_link_add")}
                  </Button>
                </div>
                {linkError && (
                  <p className="mt-1 text-xs text-destructive">
                    {t("editor_link_invalid")}
                  </p>
                )}
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>

          {maxLength && characters !== undefined && (
            <span className="ml-auto shrink-0 pr-1 text-xs text-muted-foreground">
              {characters}/{maxLength}
            </span>
          )}
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}
