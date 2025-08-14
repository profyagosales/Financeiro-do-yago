import * as React from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";

export interface QuickLinkItem {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  href?: string;
  onOpen?: () => void;
}

interface QuickLinksProps {
  items: QuickLinkItem[];
  className?: string;
}

export function QuickLinks({ items, className }: QuickLinksProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 md:grid-cols-3", className)}>
      {items.map(({ icon: Icon, title, subtitle, href, onOpen }) => {
        const commonClasses =
          "group glass-card flex items-center gap-4 p-4 text-left transition shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40";
        const content = (
          <>
            <Icon
              className="size-6 text-emerald-600 dark:text-emerald-400 transition-transform group-hover:scale-110"
              aria-hidden="true"
            />
            <div>
              <div className="font-medium">{title}</div>
              <div className="text-sm text-muted-foreground">{subtitle}</div>
            </div>
          </>
        );

        if (href) {
          return (
            <Link to={href} onClick={onOpen} key={title} className={commonClasses}>
              {content}
            </Link>
          );
        }

        return (
          <button
            type="button"
            onClick={onOpen}
            key={title}
            className={commonClasses}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
