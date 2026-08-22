import { cn } from "@/utils";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function PillTabs({ children, className }: Props) {
  return (
    <nav
      className={cn(
        "flex overflow-x-auto border-b mt-5 mb-2 px-4 md:px-6 justify-center max-w-fit mx-auto",
        className,
      )}
    >
      {children}
    </nav>
  );
}
