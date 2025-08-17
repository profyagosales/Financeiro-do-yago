import type { PropsWithChildren } from "react";

import Header from "@/components/layout/Header";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  mainClassName?: string;
}>;

export default function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <div className="min-h-screen">
      <Header />
      <main
        className={cn(
          'mx-auto w-full max-w-screen-2xl p-6 pt-[96px]',
          mainClassName,
        )}
      >
        {children}
      </main>
    </div>
  );
}
