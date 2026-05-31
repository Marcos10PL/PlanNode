import { revokeInvitationAction } from "@/actions/workspace/revoke-invitation";
import { Button } from "@/components/ui/button";
import { WorkspaceInvitation } from "@/types/entities";
import { getRoleLabel } from "@/utils";
import { Badge } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const InvitationRow = ({ invitation }: { invitation: WorkspaceInvitation }) => {
  const t = useTranslations();
  const [isPending, setIsPending] = useState(false);

  const handleRevoke = async () => {
    setIsPending(true);
    const result = await revokeInvitationAction(invitation.id);
    setIsPending(false);
    if (result?.error) {
      toast.error(t("team.revoke_error"));
    } else {
      toast.success(t("team.revoke_success"));
    }
  };

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{invitation.email}</p>
      </div>
      <Badge className="shrink-0">{getRoleLabel(invitation.role, t)}</Badge>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRevoke}
        disabled={isPending}
        className="text-destructive hover:text-destructive shrink-0"
      >
        {t("team.revoke")}
      </Button>
    </div>
  );
};
