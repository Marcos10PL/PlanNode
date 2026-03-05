import Container from "@/components/ui/container";
import Logo from "@/components/app-logo";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export default function AppFooter({
  withoutLogo = false,
}: {
  withoutLogo?: boolean;
}) {
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
        {!withoutLogo && <Logo size="sm" />}
        <p className="text-xs text-muted-foreground">
          © 2026 {t("all_rights_reserved")}
        </p>
      </Container>
    </footer>
  );
}
