"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type ControlledInputFieldControlledProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  mode?: "controlled";
  control: Control<TFieldValues>;
  name: TName;
  label: React.ReactNode;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
  className?: string;
};

type ControlledInputFieldReadonlyProps = {
  mode: "readonly";
  id: string;
  label: React.ReactNode;
  value: string;
  type?: React.HTMLInputTypeAttribute;
};

type ControlledInputFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> =
  | ControlledInputFieldControlledProps<TFieldValues, TName>
  | ControlledInputFieldReadonlyProps;

function ControlledInputFieldReadonly({
  id,
  label,
  value,
  type = "text",
}: ControlledInputFieldReadonlyProps) {
  return (
    <div className="grid gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input id={id} type={type} value={value} disabled readOnly />
    </div>
  );
}

function ControlledInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: ControlledInputFieldProps<TFieldValues, TName>) {
  if (props.mode === "readonly") {
    return <ControlledInputFieldReadonly {...props} />;
  }

  const {
    control,
    name,
    label,
    placeholder,
    type = "text",
    autoComplete,
    disabled,
    readOnly,
    maxLength,
    className,
  } = props;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            id={field.name}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            disabled={disabled}
            readOnly={readOnly}
            maxLength={maxLength}
            aria-invalid={fieldState.invalid}
            className={className}
          />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

export { ControlledInputField };
