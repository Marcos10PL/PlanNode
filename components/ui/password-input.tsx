"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  showLabel?: string;
  hideLabel?: string;
  buttonClassName?: string;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { className, showLabel, hideLabel, buttonClassName, disabled, ...props },
    ref,
  ) => {
    const t = useTranslations("password_input");
    const [isVisible, setIsVisible] = React.useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={isVisible ? "text" : "password"}
          className={cn("pr-10", className)}
          disabled={disabled}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(
            "absolute right-1 top-1/2 size-7 -translate-y-1/2 text-muted-foreground hover:text-foreground",
            buttonClassName,
          )}
          onClick={() => setIsVisible(prev => !prev)}
          aria-label={
            isVisible ? (hideLabel ?? t("hide")) : (showLabel ?? t("show"))
          }
        >
          {isVisible ? (
            <EyeOff className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </Button>
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
