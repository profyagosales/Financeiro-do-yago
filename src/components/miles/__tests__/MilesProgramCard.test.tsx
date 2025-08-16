import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import MilesProgramCard from '../MilesProgramCard';

describe('MilesProgramCard', () => {
  function setup(path: string = '/') {
    return render(
  <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/*" element={
            <div>
              <MilesProgramCard program="livelo" />
              <MilesProgramCard program="latampass" />
              <MilesProgramCard program="azul" />
            </div>
          } />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renderiza labels dos programas', () => {
    setup();
    expect(screen.getByRole('link', { name: /programa livelo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /programa latam pass/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /programa azul/i })).toBeInTheDocument();
  });

  it('marca aria-current para rota ativa', () => {
    setup('/milhas/latampass');
    const active = screen.getByRole('link', { name: /latam pass/i });
    expect(active).toHaveAttribute('aria-current', 'page');
  });
});
