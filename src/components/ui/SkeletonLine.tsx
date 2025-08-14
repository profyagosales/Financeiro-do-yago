import { Skeleton } from "./Skeleton";

import { cn } from "@/lib/utils";

export function SkeletonLine({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

export default SkeletonLine;
