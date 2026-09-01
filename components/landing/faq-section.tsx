import { Container } from "@/components/ui/container";
import { useTranslations } from "next-intl";

type FaqItem = { question: string; answer: string };

export function FaqSection() {
  const t = useTranslations("landing.faq");

  const items: FaqItem[] = [
    { question: t("items.0.question"), answer: t("items.0.answer") },
    { question: t("items.1.question"), answer: t("items.1.answer") },
    { question: t("items.2.question"), answer: t("items.2.answer") },
    { question: t("items.3.question"), answer: t("items.3.answer") },
  ];

  return (
    <Container as="section" className="flex flex-col gap-10 py-16">
      <h2 className="text-2xl md:text-3xl font-semibold text-center">
        {t("title")}
      </h2>

      <div className="flex flex-col divide-y max-w-2xl mx-auto w-full">
        {items.map((item, i) => (
          <details key={i} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium list-none">
              {item.question}
              <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </Container>
  );
}
