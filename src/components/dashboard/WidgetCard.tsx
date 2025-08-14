import { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

interface WidgetCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export default function WidgetCard({
  title,
  children,
  className,
  ...rest
}: PropsWithChildren<WidgetCardProps>) {
  return (
    <div
      className={cn(
        'rounded-xl p-4 shadow-sm bg-gradient-to-br from-white/80 to-white/60 dark:from-zinc-900/80 dark:to-zinc-900/60 backdrop-blur-sm',
        rest.onClick && 'cursor-pointer transition hover:shadow-md',
        className
      )}
      {...rest}
    >
      {title && <h3 className="mb-2 font-semibold">{title}</h3>}
      {children}
    </div>
  );
}
