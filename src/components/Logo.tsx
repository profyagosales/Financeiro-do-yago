import * as React from "react";

export type LogoProps = {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "mark";
  monochrome?: boolean;
};

const SIZE_MAP: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 24,
  md: 32,
  lg: 48,
};

function Logo({
  size = "md",
  variant = "mark",
  monochrome = false,
}: LogoProps) {
  const id = React.useId();
  const dimension = SIZE_MAP[size];

  const gradient = !monochrome ? (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="48" y2="48">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
  ) : null;

  const mark = (
    <>
      {gradient}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill={monochrome ? "currentColor" : `url(#${id})`}
      />
      <path
        d="M13 18h14M13 24h10M25 18v12M30 24h5M35 24v6"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </>
  );

  if (variant === "mark") {
    return (
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 48 48"
        fill="none"
        aria-label="Logo Financeiro do Yago"
      >
        {mark}
      </svg>
    );
  }

  return (
    <svg
      width={dimension * 6}
      height={dimension}
      viewBox="0 0 300 48"
      fill="none"
      aria-label="Logo Financeiro do Yago"
    >
      {mark}
      <text
        x="60"
        y="32"
        fontSize="24"
        fontFamily="sans-serif"
        fill={monochrome ? "currentColor" : "#0f172a"}
      >
        Financeiro do Yago
      </text>
    </svg>
  );
}

export default Logo;
export { Logo };
