import React from "react";

export default function MiniArea({ points }: { points: number[] }) {
  const max = Math.max(1, ...points);
  const path = points
    .map((v, i) => `${(i / (points.length - 1)) * 100},${100 - (v / max) * 100}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-12 w-full">
      <polyline fill="url(#g)" stroke="none" points={`0,100 ${path} 100,100`} />
      <defs>
        <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(16 185 129)" stopOpacity=".35" />
          <stop offset="100%" stopColor="rgb(16 185 129)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
