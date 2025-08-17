import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'animate-pulse rounded-md bg-[linear-gradient(90deg,#ececec,#f5f5f5,#ececec)] bg-[length:800px_100%]',
        className
      )}
    />
  );
}

export default Skeleton;

