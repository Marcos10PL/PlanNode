import { usePresence } from "@/components/providers/presence-provider";
import { Avatar, AvatarBadge, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  name: string;
  userId?: string;
  className?: string;
};

export default function UserAvatar({ name, userId, className }: Props) {
  const { isOnline } = usePresence();
  const online = !!userId && isOnline(userId);

  return (
    <span className="relative inline-flex shrink-0">
      <Avatar className={className}>
        <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      {online && <AvatarBadge className="size-2.5 bg-emerald-500" />}
    </span>
  );
}
