import { AppLogo } from "@/components/app-logo";
import { Container } from "@/components/ui/container";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/utils";
import { useTranslations } from "next-intl";

export function AppFooter({ withoutLogo = false }: { withoutLogo?: boolean }) {
  const t = useTranslations("footer");

  return (
    <footer>
      {!withoutLogo && <Separator />}
      <Container
        className={cn(
          "flex flex-col gap-4 sm:flex-row items-center justify-between py-6",
          withoutLogo && "justify-center",
        )}
      >
        {!withoutLogo && <AppLogo size="sm" />}
        <p className="text-xs text-muted-foreground">
          © 2026 {t("all_rights_reserved")}
        </p>
      </Container>
    </footer>
  );
}
