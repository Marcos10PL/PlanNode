"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/ui/password-input";

type ControlledPasswordFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: React.ReactNode;
  labelRight?: React.ReactNode;
  placeholder?: string;
  autoComplete?: string;
  showLabel?: string;
  hideLabel?: string;
};

function ControlledPasswordField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  labelRight,
  placeholder,
  autoComplete,
  showLabel,
  hideLabel,
}: ControlledPasswordFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          {labelRight ? (
            <div className="flex items-center">
              <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
              {labelRight}
            </div>
          ) : (
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          )}
          <PasswordInput
            {...field}
            id={field.name}
            placeholder={placeholder}
            autoComplete={autoComplete}
            showLabel={showLabel}
            hideLabel={hideLabel}
            aria-invalid={fieldState.invalid}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { ControlledPasswordField };
