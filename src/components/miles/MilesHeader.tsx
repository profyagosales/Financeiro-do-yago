import type { ReactNode, SVGProps, FC } from 'react';

import { LiveloLogo, LatamPassLogo, AzulLogo } from './BrandLogos';

export type MilesProgram = 'livelo' | 'latampass' | 'azul';

type BrandCfg = {
  name: string;
  color: string; // primary brand color
  gradient: string; // tailwind gradient classes
  Logo: FC<SVGProps<SVGSVGElement>>;
};

export const BRAND: Record<MilesProgram, BrandCfg> = {
  livelo: {
    name: 'Livelo',
    color: '#EA1E79',
    gradient: 'from-fuchsia-600 via-pink-500 to-rose-500',
    Logo: LiveloLogo,
  },
  latampass: {
    name: 'LATAM Pass',
    color: '#C8102E',
    gradient: 'from-red-600 via-rose-600 to-purple-600',
    Logo: LatamPassLogo,
  },
  azul: {
    name: 'Azul',
    color: '#0075C9',
    gradient: 'from-sky-600 via-cyan-600 to-blue-600',
    Logo: AzulLogo,
  },
};

export default function MilesHeader({
  program,
  subtitle,
  children,
}: {
  program: MilesProgram;
  subtitle?: string;
  children?: ReactNode;
}) {
  const brand = BRAND[program];
  const Logo = brand.Logo;
  return (
    <header className={`mb-6 rounded-xl text-white bg-gradient-to-r ${brand.gradient}`}>
      <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Logo className="h-7 w-7 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-xl font-semibold">Milhas — {brand.name}</h1>
            {subtitle ? (
              <p className="text-white/80 text-sm leading-relaxed truncate">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {children ? <div className="shrink-0">{children}</div> : null}
      </div>
    </header>
  );
}

