import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Hero section displayed at the top of the dashboard.
// This component contains only presentational markup and
// can be replaced by a more feature rich version later on.
  export default function HeroSection() {
    return (
      <div className="glass hero-gradient relative overflow-hidden rounded-xl p-6 text-white">
      <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <LogoFY size={44} />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Finanças do Yago</h1>
        </div>
          <div className="mt-1 flex gap-2 md:mt-0">
            <Link
              to="/financas/mensal"
              className="rounded-xl bg-white/90 px-4 py-2 font-medium text-emerald-700 shadow transition hover:bg-white"
            >
              Ver Finanças
              <ArrowRight className="ml-2 inline size-4" />
            </Link>
            <Link
              to="/investimentos/resumo"
              className="rounded-xl bg-white/15 px-4 py-2 font-medium text-white ring-1 ring-white/30 transition hover:bg-white/20"
            >
              Ver Investimentos
              <ArrowRight className="ml-2 inline size-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

// Logo “FY” estilizada em SVG
function LogoFY({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Logo Finanças do Yago"
      className="rounded-xl shadow-md"
    >
      <defs>
        <linearGradient id="fy-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="fy-txt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#fy-bg)" />
      <circle cx="50" cy="14" r="18" fill="#fff" opacity="0.15" />
      <g transform="translate(12,16)" fill="url(#fy-txt)">
        <path d="M4 0h22v6H10v6h12v6H4z" />
        <path d="M34 0l-6 9 6 9h-8l-4-6-4 6h-8l6-9-6-9h8l4 6 4-6z" />
      </g>
    </svg>
  );
}
