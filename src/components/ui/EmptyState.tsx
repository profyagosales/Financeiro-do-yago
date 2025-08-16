import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
  "flex flex-col items-center justify-center gap-2 py-10 text-center text-fg-muted",
        className
      )}
    >
      {icon ? <div className="mb-2">{icon}</div> : null}
      {title ? <h3 className="text-sm font-medium">{title}</h3> : null}
      {message ? <p className="text-sm">{message}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export default EmptyState;

