import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import HomeOverview from '../HomeOverview';

vi.mock('@/state/periodFilter', () => ({
  usePeriod: () => ({ mode: 'month', month: 1, year: 2025 }),
  periodRange: () => ({ start: new Date('2025-01-01'), end: new Date('2025-12-31') }),
}));

vi.mock('framer-motion', () => {
  const MotionStub = (allProps: any) => {
    const {
      animate,
      initial,
      exit,
      variants,
      transition,
      whileHover,
      whileTap,
      whileInView,
      layout,
      layoutId,
      drag,
      dragConstraints,
      dragElastic,
      dragMomentum,
      dragTransition,
      onAnimationStart,
      onAnimationComplete,
      ...rest
    } = allProps || {};
    return <div {...rest} />;
  };
  return {
    motion: new Proxy({}, { get: () => MotionStub }),
  };
});

// Simplifica Logo (evita carregar svg grande)
vi.mock('@/components/Logo', () => ({ default: () => <div>Logo</div> }));

// Evita carregar AlertList complexa
vi.mock('@/components/dashboard/AlertList', () => ({
  __esModule: true,
  default: ({ items }: any) => <div data-testid="alerts">{items.length} alertas</div>,
}));

// Evita Suspense real de OverviewChart
// Mocka o componente carregado via lazy imediatamente (evita Suspense warnings)
vi.mock('@/components/overview/OverviewChart', () => ({
  __esModule: true,
  default: ({ data }: any) => <div data-testid="overview-chart">{data.length} pts</div>,
}));


describe('HomeOverview', () => {
  it('renderiza KPIs principais', async () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <HomeOverview />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Saldo')).toBeInTheDocument());
    expect(screen.getByText('Gastos do mês')).toBeInTheDocument();
    expect(screen.getByText('Rentabilidade')).toBeInTheDocument();
  });
});
