import { cn } from "@/lib/utils";

export function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-4 w-full animate-shimmer rounded bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] bg-[length:800px_100%]",
        className
      )}
    />
  );
}

export default SkeletonLine;
