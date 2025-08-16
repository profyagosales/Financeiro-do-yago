export const BRAND = {
  livelo: { bg: 'from-[#F3007B] to-[#B311FF]' },
  latampass: { bg: 'from-[#B40037] to-[#E61B47]' },
  azul: { bg: 'from-[#009BDF] to-[#0056A7]' },
} as const;

export type BrandKey = keyof typeof BRAND;
