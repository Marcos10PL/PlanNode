import type { ManageMenuItem } from "@/components/ui/manage-menu";
import { PROJECT_COLORS, PROJECT_ICONS } from "@/const";
import { Translations } from "@/types";
import {
  BarChart3,
  Book,
  Briefcase,
  Calendar,
  CheckCircle2,
  Code,
  Flag,
  FolderKanban,
  Globe,
  Heart,
  Lightbulb,
  LucideIcon,
  Palette,
  Pencil,
  Rocket,
  Shield,
  Star,
  Target,
  Trash2,
  Wrench,
  Zap,
} from "lucide-react";

export type ProjectIcon = (typeof PROJECT_ICONS)[keyof typeof PROJECT_ICONS];
export type ProjectColor = (typeof PROJECT_COLORS)[keyof typeof PROJECT_COLORS];

const PROJECT_ICON_MAP = {
  [PROJECT_ICONS.FOLDER_KANBAN]: FolderKanban,
  [PROJECT_ICONS.ROCKET]: Rocket,
  [PROJECT_ICONS.LIGHTBULB]: Lightbulb,
  [PROJECT_ICONS.BAR_CHART]: BarChart3,
  [PROJECT_ICONS.TARGET]: Target,
  [PROJECT_ICONS.SHIELD]: Shield,
  [PROJECT_ICONS.WRENCH]: Wrench,
  [PROJECT_ICONS.BOOK]: Book,
  [PROJECT_ICONS.GLOBE]: Globe,
  [PROJECT_ICONS.HEART]: Heart,
  [PROJECT_ICONS.ZAP]: Zap,
  [PROJECT_ICONS.FLAG]: Flag,
  [PROJECT_ICONS.BRIEFCASE]: Briefcase,
  [PROJECT_ICONS.CALENDAR]: Calendar,
  [PROJECT_ICONS.CODE]: Code,
  [PROJECT_ICONS.PALETTE]: Palette,
} as const satisfies Record<ProjectIcon, LucideIcon>;

const PROJECT_COLOR_TEXT_MAP = {
  [PROJECT_COLORS.NEUTRAL]: "text-foreground",
  [PROJECT_COLORS.RED]: "text-red-500",
  [PROJECT_COLORS.ORANGE]: "text-orange-500",
  [PROJECT_COLORS.AMBER]: "text-amber-500",
  [PROJECT_COLORS.YELLOW]: "text-yellow-500",
  [PROJECT_COLORS.LIME]: "text-lime-500",
  [PROJECT_COLORS.GREEN]: "text-green-500",
  [PROJECT_COLORS.EMERALD]: "text-emerald-500",
  [PROJECT_COLORS.TEAL]: "text-teal-500",
  [PROJECT_COLORS.CYAN]: "text-cyan-500",
  [PROJECT_COLORS.SKY]: "text-sky-500",
  [PROJECT_COLORS.BLUE]: "text-blue-500",
  [PROJECT_COLORS.INDIGO]: "text-indigo-500",
  [PROJECT_COLORS.VIOLET]: "text-violet-500",
  [PROJECT_COLORS.PURPLE]: "text-purple-500",
  [PROJECT_COLORS.PINK]: "text-pink-500",
} as const satisfies Record<ProjectColor, string>;

const PROJECT_COLOR_BORDER_MAP = {
  [PROJECT_COLORS.NEUTRAL]: "border-foreground/30",
  [PROJECT_COLORS.RED]: "border-red-500/40",
  [PROJECT_COLORS.ORANGE]: "border-orange-500/40",
  [PROJECT_COLORS.AMBER]: "border-amber-500/40",
  [PROJECT_COLORS.YELLOW]: "border-yellow-500/40",
  [PROJECT_COLORS.LIME]: "border-lime-500/40",
  [PROJECT_COLORS.GREEN]: "border-green-500/40",
  [PROJECT_COLORS.EMERALD]: "border-emerald-500/40",
  [PROJECT_COLORS.TEAL]: "border-teal-500/40",
  [PROJECT_COLORS.CYAN]: "border-cyan-500/40",
  [PROJECT_COLORS.SKY]: "border-sky-500/40",
  [PROJECT_COLORS.BLUE]: "border-blue-500/40",
  [PROJECT_COLORS.INDIGO]: "border-indigo-500/40",
  [PROJECT_COLORS.VIOLET]: "border-violet-500/40",
  [PROJECT_COLORS.PURPLE]: "border-purple-500/40",
  [PROJECT_COLORS.PINK]: "border-pink-500/40",
} as const satisfies Record<ProjectColor, string>;

const PROJECT_COLOR_BG_MAP = {
  [PROJECT_COLORS.NEUTRAL]: "bg-foreground",
  [PROJECT_COLORS.RED]: "bg-red-500",
  [PROJECT_COLORS.ORANGE]: "bg-orange-500",
  [PROJECT_COLORS.AMBER]: "bg-amber-500",
  [PROJECT_COLORS.YELLOW]: "bg-yellow-500",
  [PROJECT_COLORS.LIME]: "bg-lime-500",
  [PROJECT_COLORS.GREEN]: "bg-green-500",
  [PROJECT_COLORS.EMERALD]: "bg-emerald-500",
  [PROJECT_COLORS.TEAL]: "bg-teal-500",
  [PROJECT_COLORS.CYAN]: "bg-cyan-500",
  [PROJECT_COLORS.SKY]: "bg-sky-500",
  [PROJECT_COLORS.BLUE]: "bg-blue-500",
  [PROJECT_COLORS.INDIGO]: "bg-indigo-500",
  [PROJECT_COLORS.VIOLET]: "bg-violet-500",
  [PROJECT_COLORS.PURPLE]: "bg-purple-500",
  [PROJECT_COLORS.PINK]: "bg-pink-500",
} as const satisfies Record<ProjectColor, string>;

const isProjectIcon = (icon: string): icon is ProjectIcon =>
  Object.values(PROJECT_ICONS).includes(icon as ProjectIcon);

const isProjectColor = (color: string): color is ProjectColor =>
  Object.values(PROJECT_COLORS).includes(color as ProjectColor);

export const toProjectIcon = (icon: string): ProjectIcon =>
  isProjectIcon(icon) ? icon : PROJECT_ICONS.FOLDER_KANBAN;

export const toProjectColor = (color: string): ProjectColor =>
  isProjectColor(color) ? color : PROJECT_COLORS.NEUTRAL;

export const getProjectIcon = (icon: string) =>
  PROJECT_ICON_MAP[toProjectIcon(icon)];

export const getProjectColorTextClass = (color: string) =>
  PROJECT_COLOR_TEXT_MAP[toProjectColor(color)];

export const getProjectColorBgClass = (color: string) =>
  PROJECT_COLOR_BG_MAP[toProjectColor(color)];

export const getProjectColorBorderClass = (color: string) =>
  PROJECT_COLOR_BORDER_MAP[toProjectColor(color)];

export const getProjectManageMenuItems = ({
  canManage,
  isFavorite,
  onToggleFavorite,
  isCompleted,
  onToggleCompleted,
  onEdit,
  onDelete,
  t,
}: {
  canManage: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  isCompleted: boolean;
  onToggleCompleted: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: Translations;
}): ManageMenuItem[] => [
  {
    label: isFavorite ? t("unfavorite") : t("favorite"),
    icon: Star,
    onClick: onToggleFavorite,
  },
  ...(canManage
    ? [
        {
          label: t("edit.trigger"),
          icon: Pencil,
          onClick: onEdit,
        },
        {
          label: isCompleted ? t("mark_active") : t("mark_completed"),
          icon: CheckCircle2,
          onClick: onToggleCompleted,
        },
        {
          label: t("delete.trigger"),
          icon: Trash2,
          onClick: onDelete,
          destructive: true,
        },
      ]
    : []),
];
