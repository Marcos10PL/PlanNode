import Container from "@/components/ui/container";
import Logo from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer>
      <Separator />
      <Container className="flex flex-col gap-4 sm:flex-row items-center justify-between py-6">
        <Logo size="sm" />
        <p className="text-xs text-muted-foreground">
          © 2026 {t("all_rights_reserved")}
        </p>
      </Container>
    </footer>
  );
}
