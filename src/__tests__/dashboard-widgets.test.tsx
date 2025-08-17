import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FinSummaryCard from '@/components/dashboard/FinSummaryCard';
import GoalsProgressCard from '@/components/dashboard/GoalsProgressCard';
import InvestWatchCard from '@/components/dashboard/InvestWatchCard';
import MarketTickerCard from '@/components/dashboard/MarketTickerCard';
import MilesAlertCard from '@/components/dashboard/MilesAlertCard';
import WishesDealCard from '@/components/dashboard/WishesDealCard';

function wrap(ui: React.ReactElement){
  const qc = new QueryClient();
  return <QueryClientProvider client={qc}>{ui}</QueryClientProvider>;
}

describe('Dashboard widgets render', () => {
  it('FinSummaryCard', () => {
    const { container } = render(wrap(<FinSummaryCard/>));
    expect(container.firstChild).toBeTruthy();
  });
  it('InvestWatchCard', () => {
    const { container } = render(wrap(<InvestWatchCard/>));
    expect(container.firstChild).toBeTruthy();
  });
  it('MilesAlertCard', () => {
    const { container } = render(wrap(<MilesAlertCard/>));
    expect(container.firstChild).toBeTruthy();
  });
  it('GoalsProgressCard', () => {
    const { container } = render(wrap(<GoalsProgressCard/>));
    expect(container.firstChild).toBeTruthy();
  });
  it('WishesDealCard', () => {
    const { container } = render(wrap(<WishesDealCard/>));
    expect(container.firstChild).toBeTruthy();
  });
  it('MarketTickerCard', () => {
    const { container } = render(wrap(<MarketTickerCard/>));
    expect(container.firstChild).toBeTruthy();
  });
});
