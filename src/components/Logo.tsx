import React from "react";

export type LogoProps = {
  size?: "sm" | "md" | "lg" | "2xl";
  variant?: "full" | "mark";
  monochrome?: boolean;
  className?: string;
  color?: string; // para modo monocromático dinâmico
};

const SIZE_MAP: Record<Exclude<LogoProps["size"], undefined>, number> = {
  sm: 24,
  md: 32,
  lg: 48,
  '2xl': 68,
};

function Logo({
  size = "md",
  variant = "mark",
  monochrome = false,
  className,
  color,
}: LogoProps) {
  const id = React.useId();
  const dimension = SIZE_MAP[size];

  const gradient = !monochrome ? (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="48" y2="48">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#d1fae5" />
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
        fill={monochrome ? (color || 'currentColor') : `url(#${id})`}
  className="transition-colors duration-500 ease-out"
      />
      <path
        d="M13 18h14M13 24h10M25 18v12M30 24h5M35 24v6"
  // Stroke do desenho interno permanece sempre branco para consistência visual
  stroke={'white'}
        strokeWidth="3"
        strokeLinecap="round"
  className="transition-colors duration-500 ease-out"
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
  className={[className, 'transition-colors duration-500 ease-out'].filter(Boolean).join(' ')}
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
      className={className}
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
