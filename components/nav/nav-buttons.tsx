import { Suspense } from "react";
import LanguageSwitcher from "../language-switcher";
import { ThemeSwitcher } from "../theme-switcher";
import { Separator } from "../ui/separator";
import { AuthButton } from "../auth/auth-button";

export default function NavButtons() {
  return (
    <div className="flex items-center gap-2 h-full">
      <ThemeSwitcher />
      <LanguageSwitcher />

      <Separator orientation="vertical" className="min-h-8" />

      <Suspense>
        <AuthButton />
      </Suspense>
    </div>
  );
}
