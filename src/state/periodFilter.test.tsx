import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PeriodProvider, periodRange, usePeriod, type Mode } from './periodFilter';

function Consumer() {
  const { mode, month, year, setMode, setMonth, setYear } = usePeriod();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="month">{month}</span>
      <span data-testid="year">{year}</span>
      <button onClick={() => setMode('yearly')}>yearly</button>
      <button onClick={() => setMonth(12)}>setMonth</button>
      <button onClick={() => setYear(2099)}>setYear</button>
    </div>
  );
}

describe('PeriodProvider / usePeriod', () => {
  const fixedNow = new Date('2025-05-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
    localStorage.clear();
    // reset URL
    window.history.replaceState(null, '', '/');
  });

  it('fornece valores padrão baseados na data atual', () => {
    render(
      <PeriodProvider>
        <Consumer />
      </PeriodProvider>
    );
    expect(screen.getByTestId('mode').textContent).toBe('monthly');
    expect(Number(screen.getByTestId('month').textContent)).toBe(5); // Maio (5)
    expect(Number(screen.getByTestId('year').textContent)).toBe(2025);
  });

  it('aplica valores vindos da URL (prioridade sobre localStorage)', () => {
    window.history.replaceState(null, '', '/?mode=quarterly&month=4&year=2024');
    render(
      <PeriodProvider>
        <Consumer />
      </PeriodProvider>
    );
    expect(screen.getByTestId('mode').textContent).toBe('quarterly');
    expect(Number(screen.getByTestId('month').textContent)).toBe(4);
    expect(Number(screen.getByTestId('year').textContent)).toBe(2024);
  });

  it('atualiza estado, URL e localStorage ao mudar campos', () => {
    render(
      <PeriodProvider>
        <Consumer />
      </PeriodProvider>
    );
    act(() => {
      fireEvent.click(screen.getByText('yearly'));
      fireEvent.click(screen.getByText('setMonth'));
      fireEvent.click(screen.getByText('setYear'));
    });
    expect(screen.getByTestId('mode').textContent).toBe('yearly');
    expect(screen.getByTestId('month').textContent).toBe('12');
    expect(screen.getByTestId('year').textContent).toBe('2099');
    // URL: modo yearly não mantém month
    expect(window.location.search).toMatch(/mode=yearly/);
    expect(window.location.search).not.toMatch(/month=/);
    // localStorage persistido
    const persisted = JSON.parse(localStorage.getItem('fy.period') || '{}');
    expect(persisted).toMatchObject({ mode: 'yearly', month: 12, year: 2099 });
  });

  it('gera erro ao usar usePeriod fora do provider', () => {
    function Outside() {
      usePeriod();
      return null;
    }
    expect(() => render(<Outside />)).toThrow(/usePeriod/);
  });
});

describe('periodRange', () => {
  function assertRange(mode: Mode, month: number, year: number, expStart: string, expEnd: string) {
    const { start, end } = periodRange({ mode, month, year });
    expect(start.toISOString().slice(0, 10)).toBe(expStart);
    expect(end.toISOString().slice(0, 10)).toBe(expEnd);
  }

  it('monthly', () => {
    assertRange('monthly', 3, 2025, '2025-03-01', '2025-03-31');
  });
  it('quarterly (Q2 a partir de mês 5)', () => {
    assertRange('quarterly', 5, 2025, '2025-04-01', '2025-06-30');
  });
  it('yearly', () => {
    assertRange('yearly', 7, 2025, '2025-01-01', '2025-12-31');
  });
  it('custom', () => {
    assertRange('custom', 8, 2025, '2025-08-01', '2025-08-01');
  });
});
