"use client";

import { ProjectWithProgress } from "@/types/dto";
import { useTranslations } from "next-intl";
import { ProjectCard } from "./project-card";

type Props = {
  projects: ProjectWithProgress[];
  canManage: boolean;
};

export function ProjectList({ projects, canManage }: Props) {
  const t = useTranslations("projects");

  if (projects.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} canManage={canManage} />
      ))}
    </div>
  );
}
