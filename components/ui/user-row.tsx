import { Badge } from "@/components/ui/badge";
import UserAvatar from "@/components/user-avatar";
import { WorkspaceRole } from "@/types/entities";
import { cn, getRoleLabel, getRoleVariant } from "@/utils";
import { useTranslations } from "next-intl";
import { useUser } from "../providers/user-provider";

type Props = {
  name: string;
  email: string;
  role?: WorkspaceRole;
  className?: string;
  children?: React.ReactNode;
  userId: string;
  showBadge?: boolean;
};

export function UserRow({
  name,
  email,
  role,
  userId,
  className,
  children,
  showBadge,
}: Props) {
  const t = useTranslations();
  const { user } = useUser();

  const isSelf = userId === user.id;

  return (
    <div className={cn("flex items-center gap-3 py-2", className)}>
      <UserAvatar name={name} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium line-clamp-1">
          {name} {isSelf && `(${t("team.you")})`}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-1">{email}</p>
      </div>

      {children}

      {role && showBadge && (
        <Badge
          variant={getRoleVariant(role)}
          className="shrink-0 pointer-events-none"
        >
          {getRoleLabel(role, t)}
        </Badge>
      )}
    </div>
  );
}
