import { Button } from "@/components/ui/button";
import { LINKS } from "@/const";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function ProjectNotFound() {
  const t = await getTranslations("projects");

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-20">
      <h1 className="text-lg font-semibold">{t("not_found_title")}</h1>
      <p className="text-sm text-muted-foreground">
        {t("not_found_description")}
      </p>
      <Button asChild variant="outline">
        <Link href={LINKS.PROJECTS}>{t("back_to_projects")}</Link>
      </Button>
    </div>
  );
}
