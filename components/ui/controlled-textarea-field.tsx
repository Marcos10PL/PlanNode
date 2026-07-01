"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type ControlledTextareaFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: React.ReactNode;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
};

function ControlledTextareaField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder,
  maxLength,
  rows = 5,
  disabled,
}: ControlledTextareaFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Textarea
            {...field}
            id={field.name}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
          />
          <div className="flex justify-between">
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            {maxLength && (
              <span className="text-xs text-muted-foreground ml-auto">
                {(field.value as string)?.length ?? 0}/{maxLength}
              </span>
            )}
          </div>
        </Field>
      )}
    />
  );
}

export { ControlledTextareaField };
