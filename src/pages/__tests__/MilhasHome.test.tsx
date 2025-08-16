import * as AuthContext from '@/contexts/AuthContext';

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MilhasHome from '../MilhasHome';

// Mock simples para ícone e componentes usados internamente se necessário
vi.mock('@/components/icons', () => ({ Plane: (p: any) => <svg {...p} /> }));

describe('MilhasHome', () => {
  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: { id: 'u1', email: 'u@test' },
      loading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    } as any);
  });
  it('exibe os programas de milhas com labels', () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <MilhasHome />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /livelo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /latam pass/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /azul/i })).toBeInTheDocument();
  });
});
