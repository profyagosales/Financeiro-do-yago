import { Suspense, lazy } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
// Use o Toaster direto do sonner para ter 'richColors' tipado
import { Toaster } from 'sonner';

import AppHotkeys from '@/components/AppHotkeys';
import RouteLoader from '@/components/RouteLoader';
import AppShell from '@/components/AppShell';
import AppTopbar from '@/components/AppTopbar';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { PeriodProvider } from '@/contexts/PeriodContext';
/* ---------- lazy imports de páginas ---------- */
const FinancasResumo = lazy(() => import('./pages/FinancasResumo'));
// Visão geral com cartões-resumo dos módulos
const Dashboard      = lazy(() => import('./pages/HomeOverview'));
const FinancasMensal = lazy(() => import('./pages/FinancasMensal'));
const FinancasAnual  = lazy(() => import('./pages/FinancasAnual'));

// ✅ manter apenas a página em PT-BR
const Investimentos  = lazy(() => import('./pages/Investimentos'));

const CarteiraRendaFixa = lazy(() => import('./pages/CarteiraRendaFixa'));
const CarteiraFIIs      = lazy(() => import('./pages/CarteiraFIIs'));
const CarteiraBolsa     = lazy(() => import('./pages/CarteiraBolsa'));
const CarteiraCripto    = lazy(() => import('./pages/CarteiraCripto'));

const Metas = lazy(() => import('./pages/Metas'));

const MilhasHome   = lazy(() => import('./pages/MilhasHome'));
const MilhasLivelo = lazy(() => import('./pages/MilhasLivelo'));
const MilhasLatam  = lazy(() => import('./pages/MilhasLatam'));
const MilhasAzul   = lazy(() => import('./pages/MilhasAzul'));

const ListaDesejos = lazy(() => import('./pages/ListaDesejos'));
const ListaCompras = lazy(() => import('./pages/ListaCompras'));

const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const Login         = lazy(() => import('./pages/Login'));
const Confirm       = lazy(() => import('./pages/Confirm'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

/* ────────────────────────────────────────────── */

export default function App() {
  return (
    <AuthProvider>
      <PeriodProvider>
        <Router>
          {/* Toaster global */}
          <Toaster richColors position="top-right" />
          <AppRoutes />
        </Router>
      </PeriodProvider>
    </AuthProvider>
  );
}

/* ---------- Rotas protegidas / login ---------- */
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <RouteLoader />;
  if (!user)
    return (
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* rotas públicas para e-mails do Supabase */}
          <Route path="/confirm" element={<Confirm />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* rota explícita de login */}
          <Route path="/login" element={<Login />} />
          {/* fallback para qualquer outra rota não autenticada */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    );

  return (
    <AppShell topbar={<AppTopbar />}>
      {/* ⬇️ Atalhos globais (g d, g f, g i, g m, g c, Shift+/? para ajuda) */}
      <AppHotkeys />

      <Suspense fallback={<RouteLoader />}>

        <Routes>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Dashboard />} />

            {/* Finanças */}
            <Route path="/financas/resumo" element={<FinancasResumo />} />
            <Route path="/financas/mensal" element={<FinancasMensal />} />
            <Route path="/financas/anual"  element={<FinancasAnual />} />

            {/* Investimentos */}
            <Route path="/investimentos/resumo" element={<Investimentos />} />
            <Route path="/investimentos" element={<Navigate to="/investimentos/resumo" replace />} />
            <Route path="/investments" element={<Navigate to="/investimentos/resumo" replace />} />
            <Route path="/carteira" element={<Navigate to="/investimentos/resumo" replace />} />
            <Route path="/investimentos/renda-fixa" element={<CarteiraRendaFixa />} />
            <Route path="/investimentos/fiis"       element={<CarteiraFIIs />} />
            <Route path="/investimentos/bolsa"      element={<CarteiraBolsa />} />
            <Route path="/investimentos/cripto"     element={<CarteiraCripto />} />

            {/* Metas & Projetos */}
            <Route path="/metas" element={<Metas />} />

            {/* Milhas */}
            <Route path="/milhas"           element={<MilhasHome />} />
            <Route path="/milhas/livelo"    element={<MilhasLivelo />} />
            <Route path="/milhas/latampass" element={<MilhasLatam />} />
            <Route path="/milhas/azul"      element={<MilhasAzul />} />

            {/* Listas */}
            <Route path="/desejos" element={<ListaDesejos />} />
            <Route path="/compras" element={<ListaCompras />} />
            <Route path="/lista-desejos" element={<Navigate to="/desejos" replace />} />
            <Route path="/lista-compras" element={<Navigate to="/compras" replace />} />

            {/* Configurações */}
            <Route path="/configuracoes" element={<Configuracoes />} />

            {/* 404 */}
            <Route path="*" element={<h1>Página não encontrada (404)</h1>} />
          </Routes>
        </Suspense>
      </AppShell>
    );
}
