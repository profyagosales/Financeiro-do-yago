import { Link } from "react-router-dom";

import { Button } from "./button";

import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  className?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function EmptyState({ icon, title, message, className, action }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-10 text-center text-muted-foreground",
        className
      )}
    >
      {icon ? <div className="mb-2">{icon}</div> : null}
      {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
      {message ? <p className="text-sm">{message}</p> : null}
      {action ? (
        action.href ? (
          <Button asChild className="mt-2">
            <Link to={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button className="mt-2" onClick={action.onClick}>
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}

export default EmptyState;

