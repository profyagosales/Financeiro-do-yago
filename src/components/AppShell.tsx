import * as React from 'react';

interface AppShellProps {
  topbar?: React.ReactNode;
  children: React.ReactNode;
}

export default function AppShell({ topbar, children }: AppShellProps) {
  const topbarRef = React.useRef<HTMLDivElement>(null);
  const [paddingTop, setPaddingTop] = React.useState(0);

  React.useEffect(() => {
    const el = topbarRef.current;
    if (!el) return;

    const update = () => setPaddingTop(el.offsetHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {topbar && <div ref={topbarRef}>{topbar}</div>}
      <main className="p-6" style={{ paddingTop }}>
        {children}
      </main>
    </div>
  );
}
