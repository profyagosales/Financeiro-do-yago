import * as React from 'react';

interface AppShellProps {
  topbar?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ topbar, children }: AppShellProps) {
  return (
    <div className="min-h-screen">
      {topbar}
      <main className="p-6 pt-16 md:pt-20">{children}</main>
    </div>
  );
}
