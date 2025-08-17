import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import FinanceSummary from '@/pages/FinanceSummary';
import { PeriodProvider } from '@/contexts/PeriodContext';

// Snapshot simples para garantir estrutura inicial da página de resumo de finanças.

describe('FinanceSummary snapshot', () => {
  it('matches structure', () => {
    const { asFragment } = render(
      <PeriodProvider>
        <MemoryRouter initialEntries={['/financas/resumo']}>
          <Routes>
            <Route path='/financas/resumo' element={<FinanceSummary />} />
          </Routes>
        </MemoryRouter>
      </PeriodProvider>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});
