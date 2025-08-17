import { lazy } from 'react';
import { Route } from 'react-router-dom';

import FinanceLayout from './FinanceLayout';

// Renamed pages (FinancasResumo -> FinanceSummary etc.)
const FinanceSummary = lazy(() => import('@/pages/FinanceSummary'));
const FinanceMonthly = lazy(() => import('@/pages/FinanceMonthly'));
const FinanceAnnual = lazy(() => import('@/pages/FinanceAnnual'));

export const financeRoutes = (
  <Route path="financas" element={<FinanceLayout />}> 
    <Route index element={<FinanceSummary />} />
    <Route path="resumo" element={<FinanceSummary />} />
    <Route path="mensal" element={<FinanceMonthly />} />
    <Route path="anual" element={<FinanceAnnual />} />
  </Route>
);
