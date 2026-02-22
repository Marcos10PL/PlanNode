import Logo from "./logo";
import { AuthButton } from "./auth/auth-button";
import { Suspense } from "react";
import Container from "./ui/container";
import { ThemeSwitcher } from "./theme-switcher";
import { Separator } from "@/components/ui/separator";
import LanguageSwitcher from "./language-switcher";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Navigation() {
  return (
    <nav className="border-b py-3">
      <Container className="flex justify-between items-center">
        <Logo />

        <div className="hidden md:flex items-center gap-2 h-full">
          <SetupButtons />

          <Separator orientation="vertical" className="min-h-8" />

          <Suspense>
            <AuthButton />
          </Suspense>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <SetupButtons />

          <Separator orientation="vertical" className="min-h-8" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Menu className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="max-w-fit">
              <Suspense>
                <AuthButton />
              </Suspense>
            </PopoverContent>
          </Popover>
        </div>
      </Container>
    </nav>
  );
}

function SetupButtons() {
  return (
    <>
      <ThemeSwitcher />
      <LanguageSwitcher />
    </>
  );
}
