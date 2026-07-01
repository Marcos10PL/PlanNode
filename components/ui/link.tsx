import { Link as NavigationLink } from "@/i18n/navigation";
import * as React from "react";

import { cn } from "@/utils";

type LinkProps = React.ComponentPropsWithoutRef<typeof NavigationLink>;

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, ...props }, ref) => {
    return (
      <NavigationLink
        ref={ref}
        className={cn(
          "transition-colors hover:text-primary underline underline-offset-3",
          className,
        )}
        {...props}
      />
    );
  },
);

Link.displayName = "Link";

export { Link };
