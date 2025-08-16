import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: 'coverage',
      exclude: [
        '**/*.stories.*',
        'src/**/index.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/types/**',
        'src/**/__tests__/**',
  // Exclusões temporárias (alto volume de linhas sem testes ainda)
  'src/pages/**',
  'src/routes/**',
  'src/services/**',
      ],
      thresholds: {
  lines: 4,
  statements: 4,
  functions: 4,
  branches: 2,
      },
    },
  },
});
