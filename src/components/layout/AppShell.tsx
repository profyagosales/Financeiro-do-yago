import type { PropsWithChildren } from "react";

import Topbar from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  mainClassName?: string;
}>;

export default function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <>
      <Topbar />
      <main className={cn("p-6 pt-16 md:pt-20", mainClassName)}>{children}</main>
    </>
  );
}
