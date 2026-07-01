import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Props = {
  name: string;
  className?: string;
};

export default function UserAvatar({ name, className }: Props) {
  return (
    <Avatar className={className}>
      <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
