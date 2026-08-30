"use client";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

type ControlledRichTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: React.ReactNode;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
};

function ControlledRichTextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  maxLength,
  disabled,
}: ControlledRichTextFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <RichTextEditor
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { ControlledRichTextField };
