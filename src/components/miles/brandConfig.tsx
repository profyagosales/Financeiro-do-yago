import type { ReactElement } from "react";

import { AzulLogo, LatamPassLogo, LiveloLogo } from "./BrandLogos";

export type MilesProgram = 'livelo' | 'latampass' | 'azul';

export const BRANDS: Record<MilesProgram, {
  label: string;
  gradient: string; // classes antigas (fallback / legacy, sem variantes dark)
  soft: string;
  Logo: (props: { className?: string }) => ReactElement;
  realFrom: string; // novas cores de branding solicitadas
  realTo: string;
}> = {
  livelo: {
    label: 'Livelo',
    gradient: 'from-[#7A1FA2] to-[#FF2D8D]',
    soft: '#F7F1FA',
    Logo: LiveloLogo,
    realFrom: '#F3007B',
    realTo: '#B311FF',
  },
  latampass: {
    label: 'LATAM Pass',
    gradient: 'from-[#862633] to-[#E51C44]',
    soft: '#FBF2F4',
    Logo: LatamPassLogo,
    realFrom: '#B40037',
    realTo: '#E61B47',
  },
  azul: {
    label: 'Azul',
    gradient: 'from-[#1BA1E2] to-[#0070AD]',
    soft: '#EEF8FF',
    Logo: AzulLogo,
    realFrom: '#009BDF',
    realTo: '#0056A7',
  },
};

export default BRANDS;
