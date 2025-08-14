import type { ReactElement } from "react";

import { LiveloLogo, LatamPassLogo, AzulLogo } from "./BrandLogos";

export type MilesProgram = 'livelo' | 'latampass' | 'azul';

export const BRANDS: Record<MilesProgram, { label: string; gradient: string; soft: string; softDark: string; Logo: (props: { className?: string }) => ReactElement }> = {
  livelo: {
    label: 'Livelo',
    gradient: 'from-[#7A1FA2] to-[#FF2D8D] dark:from-[#7A1FA2CC] dark:to-[#FF2D8D99]',
    soft: '#F7F1FA',
    softDark: '#7A1FA21A',
    Logo: LiveloLogo,
  },
  latampass: {
    label: 'LATAM Pass',
    gradient: 'from-[#862633] to-[#E51C44] dark:from-[#862633CC] dark:to-[#E51C4499]',
    soft: '#FBF2F4',
    softDark: '#8626331A',
    Logo: LatamPassLogo,
  },
  azul: {
    label: 'Azul',
    gradient: 'from-[#1BA1E2] to-[#0070AD] dark:from-[#1BA1E2CC] dark:to-[#0070AD99]',
    soft: '#EEF8FF',
    softDark: '#1BA1E21A',
    Logo: AzulLogo,
  },
};

export default BRANDS;
