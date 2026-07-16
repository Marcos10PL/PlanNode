"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

export function ProjectDescription({ description }: { description: string }) {
  const t = useTranslations("projects");
  const [showMore, setShowMore] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [description]);

  const toggleShowMore = () => setShowMore(prev => !prev);

  return (
    <div>
      <div
        ref={ref}
        className={`text-sm text-muted-foreground max-w-7xl ${showMore ? "" : "truncate"}`}
      >
        {description}
      </div>
      {isTruncated && (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0"
          onClick={toggleShowMore}
        >
          {showMore ? t("show_less") : t("show_more")}
        </Button>
      )}
    </div>
  );
}
