export const BRANDS = {
  livelo: 'livelo',
  latam: 'latampass',
  azul: 'azul',
} as const;

export type BrandProgram = (typeof BRANDS)[keyof typeof BRANDS];
