import { Link } from "@/i18n/navigation";
import { Button } from "../ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { getTranslations } from "next-intl/server";
import { LINKS } from "@/const";

export async function AuthButton() {
  const supabase = await createClient();
  const t = await getTranslations("auth");

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild variant={"outline"}>
        <Link href={LINKS.login}>{t("sign_in")}</Link>
      </Button>
      <Button asChild>
        <Link href={LINKS.signUp}>{t("sign_up")}</Link>
      </Button>
    </div>
  );
}
