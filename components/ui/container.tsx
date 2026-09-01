import { cn } from "@/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "main" | "article" | "header" | "footer";
}

export function Container({
  children,
  className,
  as: Component = "div",
}: ContainerProps) {
  return (
    <Component
      className={cn("mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8", className)}
    >
      {children}
    </Component>
  );
}
