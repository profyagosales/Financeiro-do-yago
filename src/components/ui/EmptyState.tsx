import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  className?: string;
}

export function EmptyState({ icon, title, message, className }: EmptyStateProps) {
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
    </div>
  );
}

export default EmptyState;

