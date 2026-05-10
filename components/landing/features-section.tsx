import Container from "@/components/ui/container";
import { LayoutDashboard, Clock, Users, Globe } from "lucide-react";
import { useTranslations } from "next-intl";

const featureIcons: Record<string, React.ReactNode> = {
  layout: <LayoutDashboard className="h-6 w-6" />,
  clock: <Clock className="h-6 w-6" />,
  users: <Users className="h-6 w-6" />,
  globe: <Globe className="h-6 w-6" />,
};

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  const items = [
    {
      icon: "layout",
      title: t("items.0.title"),
      description: t("items.0.description"),
    },
    {
      icon: "clock",
      title: t("items.1.title"),
      description: t("items.1.description"),
    },
    {
      icon: "users",
      title: t("items.2.title"),
      description: t("items.2.description"),
    },
    {
      icon: "globe",
      title: t("items.3.title"),
      description: t("items.3.description"),
    },
  ];

  return (
    <Container as="section" className="flex flex-col gap-12 py-16">
      <h2 id="more" className="text-2xl md:text-3xl font-semibold text-center">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map(item => (
          <div
            key={item.icon}
            className="flex flex-col gap-3 p-5 rounded-xl border bg-card hover:border-foreground/20 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-foreground">
              {featureIcons[item.icon]}
            </div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </Container>
  );
}
