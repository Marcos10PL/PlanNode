import { cn } from "@/utils";

type Props = {
  title: string;
  description?: string;
  className?: string;
};

export function SubHeader({ title, description, className }: Props) {
  return (
    <div className={cn("flex flex-col mt-4 mb-6", className)}>
      <h1>{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
