import { cn } from "@/lib/utils";

type Props = {
  title: string;
  description: string;
  className?: string;
};

export function SettingsHeader({ title, description, className }: Props) {
  return (
    <div className={cn("flex flex-col", className)}>
      <h1>{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
