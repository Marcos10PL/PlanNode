import { cn } from "@/utils";

type Props = {
  title: React.ReactNode;
  description?: string;
  className?: string;
};

export function SubHeader({ title, description, className }: Props) {
  return (
    <div className={cn("flex flex-col mt-4 mb-6 min-w-0", className)}>
      <h1 className="flex items-center gap-2 min-w-0">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
