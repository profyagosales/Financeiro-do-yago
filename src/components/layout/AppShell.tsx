import { PropsWithChildren } from "react";

import AppTopbar from "@/components/TopNav";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  mainClassName?: string;
}>;

export default function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <>
      <AppTopbar />
      <main className={cn("pt-20", mainClassName)}>{children}</main>
    </>
  );
}
