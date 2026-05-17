import { Link } from "@/i18n/navigation";
import { Button } from "../ui/button";
import { getTranslations } from "next-intl/server";
import { LINKS } from "@/const";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Suspense } from "react";
import { Menu } from "lucide-react";

export async function AuthButton() {
  return (
    <>
      <div className="md:hidden flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <Menu className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="max-w-fit flex items-center gap-2"
          >
            <Suspense>
              <Buttons />
            </Suspense>
          </PopoverContent>
        </Popover>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Suspense>
          <Buttons />
        </Suspense>
      </div>
    </>
  );
}

async function Buttons() {
  const t = await getTranslations("auth");

  return (
    <>
      <Button asChild variant={"outline"}>
        <Link href={LINKS.login}>{t("sign_in")}</Link>
      </Button>
      <Button asChild>
        <Link href={LINKS.signUp}>{t("sign_up")}</Link>
      </Button>
    </>
  );
}
