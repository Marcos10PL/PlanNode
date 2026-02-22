import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { LINKS } from "@/const";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";

export async function CtaSection() {
  const t = await getTranslations("landing.cta");

  return (
    <Container
      as="section"
      className="flex flex-col items-center text-center gap-6 py-20"
    >
      <h2 className="text-3xl md:text-4xl font-bold max-w-lg leading-tight">
        {t("title")}
      </h2>

      <p className="text-muted-foreground">{t("subtitle")}</p>

      <Button size="lg" asChild>
        <Link href={LINKS.signUp}>
          {t("button")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </Container>
  );
}
