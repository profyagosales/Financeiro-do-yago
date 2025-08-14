import { useEffect, useRef, useState } from 'react';

import type { Insight } from '@/hooks/useInsights';

export type InsightBarProps = {
  insights: Insight[];
};

// Simple horizontal carousel for insights.
// Auto-scrolls every few seconds, pauses on hover and allows manual
// scroll on touch devices.
export default function InsightBar({ insights }: InsightBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const el = ref.current;
    if (!el || insights.length <= 1) return;
    const timer = setInterval(() => {
      const width = el.clientWidth;
      if (Math.ceil(el.scrollLeft + width) >= el.scrollWidth) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: width, behavior: 'smooth' });
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, insights.length]);

  if (!insights.length) return null;

  return (
    <div
      ref={ref}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
    >
      {insights.map((ins) => (
        <div
          key={ins.id}
          className="snap-center w-full shrink-0 p-4 text-sm card-surface"
        >
          {ins.message}
        </div>
      ))}
    </div>
  );
}

