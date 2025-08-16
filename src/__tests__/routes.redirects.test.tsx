import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as AuthContext from '@/contexts/AuthContext';
import App from '@/App';

describe('Redirects de Investimentos', () => {
  beforeEach(() => {
    // mock matchMedia para ThemeToggle
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }))
    });
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'user@test', user_metadata: {} },
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);
  });
  const legacyPaths = ['/investimentos', '/investimentos/resumo'];

  function LocationProbe({ onChange }: { onChange: (p: string) => void }) {
    const loc = useLocation();
    // efeito síncrono suficiente (render re-run)
    onChange(loc.pathname);
    return null;
  }

  legacyPaths.forEach(path => {
    it(`redireciona ${path} -> /investimentos/resumo`, async () => {
      let current = '';
      render(
  <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <LocationProbe onChange={(p) => { current = p; }} />
          <App />
        </MemoryRouter>
      );
      await waitFor(() => {
        expect(current).toBe('/investimentos/resumo');
      });
      // também verifica nav ativo
  const investLink = await screen.findByRole('link', { name: /investimentos/i });
  expect(investLink.getAttribute('href')).toBe('/investimentos');
    });
  });
});
