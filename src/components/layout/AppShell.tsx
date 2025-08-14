import type { PropsWithChildren } from "react";

import Topbar from "@/components/layout/Topbar";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  mainClassName?: string;
}>;

export default function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar />
        <main className={cn("p-6 pt-16 md:pt-20", mainClassName)}>{children}</main>
      </div>
    </div>
  );
}
