import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Container from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { LINKS } from "@/const";
import { Globe, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("landing.hero");
  const headlineParts = t("headline").split("\n");

  return (
    <Container
      as="section"
      className="flex flex-col items-center text-center gap-6 py-20"
    >
      <Badge variant="secondary" className="gap-1.5 px-3 py-1 text-sm">
        <Globe className="h-3.5 w-3.5" />
        {t("badge")}
      </Badge>

      <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-2xl leading-tight">
        {headlineParts[0]}
        {headlineParts[1] && (
          <>
            <br />
            <span className="text-muted-foreground">{headlineParts[1]}</span>
          </>
        )}
      </h1>

      <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
        {t("subheadline")}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <Button size="lg" asChild>
          <Link href={LINKS.signUp}>
            {t("cta_primary")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="#more">{t("cta_secondary")}</a>
        </Button>
      </div>
    </Container>
  );
}
