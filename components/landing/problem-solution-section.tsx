import { Container } from "@/components/ui/container";
import { CheckCircle2, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export function ProblemSolutionSection() {
  const t = useTranslations("landing.problem_solution");

  const beforeItems: string[] = [
    t("before_items.0"),
    t("before_items.1"),
    t("before_items.2"),
    t("before_items.3"),
  ];

  const afterItems: string[] = [
    t("after_items.0"),
    t("after_items.1"),
    t("after_items.2"),
    t("after_items.3"),
  ];

  return (
    <Container as="section" className="flex flex-col gap-10 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold text-center">
        {t("title")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {t("before_label")}
          </p>
          {beforeItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <XCircle className="h-5 w-5 mt-0.5 shrink-0 text-destructive/70" />
              <span className="text-sm text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border bg-card p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            {t("after_label")}
          </p>
          {afterItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-green-500" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
