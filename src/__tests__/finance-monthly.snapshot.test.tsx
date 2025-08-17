import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthProvider } from '@/contexts/AuthContext';
import { PeriodProvider } from '@/contexts/PeriodContext';
import FinanceMonthly from '@/pages/FinanceMonthly';

// Snapshot inicial da página mensal (estrutura básica + filtros + KPI placeholders)
// Evita regressões visuais grosseiras durante refactors.

describe('FinanceMonthly snapshot', () => {
  it('matches structure', () => {
    const { asFragment } = render(
      <AuthProvider>
        <PeriodProvider>
          <MemoryRouter initialEntries={['/financas/mensal?mes=2025-08']}>
            <Routes>
              <Route path='/financas/mensal' element={<FinanceMonthly />} />
            </Routes>
          </MemoryRouter>
        </PeriodProvider>
      </AuthProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
