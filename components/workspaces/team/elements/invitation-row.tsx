import { revokeInvitationAction } from "@/actions/workspace/revoke-invitation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WorkspaceInvitation } from "@/types/dto";
import { getRoleLabel, getRoleVariant } from "@/utils";
import { Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const InvitationRow = ({
  invitation,
}: {
  invitation: WorkspaceInvitation;
}) => {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const handleRevoke = async () => {
    setIsPending(true);
    try {
      const result = await revokeInvitationAction(invitation.id);
      if (result?.error) {
        toast.error(t("team.revoke_error"));
      } else {
        toast.success(t("team.revoke_success"));
      }
    } catch {
      toast.error(t("common.unexpected_error"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-3 py-1 bg-accent/50 pl-3 pr-2 rounded-xl">
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <p className="text-sm font-medium truncate">{invitation.email}</p>
        <Badge
          variant={getRoleVariant(invitation.role!)}
          className="shrink-0 pointer-events-none"
        >
          {getRoleLabel(invitation.role!, t)}
        </Badge>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRevoke}
            disabled={isPending}
            className="text-destructive hover:text-destructive shrink-0"
          >
            <Undo2 className="size-4!" />
          </Button>
        </TooltipTrigger>
        <TooltipContent> {t("team.revoke")}</TooltipContent>
      </Tooltip>
    </div>
  );
};
