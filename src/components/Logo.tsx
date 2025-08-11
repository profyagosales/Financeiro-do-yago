
type LogoProps = { size?: number; className?: string };

export function Logo({ size = 28, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-label="Logo Financeiro do Yago"
    >
      <defs>
        <linearGradient id="fy-g" x1="0" y1="0" x2="48" y2="48">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#fy-g)" />
      <path
        d="M13 18h14M13 24h10M25 18v12M30 24h5M35 24v6"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}