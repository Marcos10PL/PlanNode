import { ProjectWithProgress } from "@/types/dto";
import { getTranslations } from "next-intl/server";
import { ProjectCard } from "./project-card";

type Props = {
  projects: ProjectWithProgress[];
  canManage: boolean;
};

export async function ProjectList({ projects, canManage }: Props) {
  const t = await getTranslations("projects");

  if (projects.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} canManage={canManage} />
      ))}
    </div>
  );
}
