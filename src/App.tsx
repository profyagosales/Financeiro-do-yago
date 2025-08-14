import { Suspense, lazy } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AppHotkeys from '@/components/AppHotkeys';
import RouteLoader from '@/components/RouteLoader';
import Sidebar from '@/components/Sidebar';
import { Toaster } from '@/components/ui/Toasts';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
/* ---------- lazy imports de páginas ---------- */
const Dashboard      = lazy(() => import('./pages/Dashboard'));
const FinancasMensal = lazy(() => import('./pages/FinancasMensal'));
const FinancasAnual  = lazy(() => import('./pages/FinancasAnual'));

// ✅ manter apenas a página em PT-BR
const Investimentos  = lazy(() => import('./pages/Investimentos'));

const CarteiraRendaFixa = lazy(() => import('./pages/CarteiraRendaFixa'));
const CarteiraFIIs      = lazy(() => import('./pages/CarteiraFIIs'));
const CarteiraBolsa     = lazy(() => import('./pages/CarteiraBolsa'));
const CarteiraCripto    = lazy(() => import('./pages/CarteiraCripto'));

const Metas = lazy(() => import('./pages/Metas'));

const MilhasLivelo = lazy(() => import('./pages/MilhasLivelo'));
const MilhasLatam  = lazy(() => import('./pages/MilhasLatam'));
const MilhasAzul   = lazy(() => import('./pages/MilhasAzul'));

const ListaDesejos = lazy(() => import('./pages/ListaDesejos'));
const ListaCompras = lazy(() => import('./pages/ListaCompras'));

const Configuracoes = lazy(() => import('./pages/Configuracoes'));
const Login         = lazy(() => import('./pages/Login'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

/* ────────────────────────────────────────────── */

export default function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Toaster global */}
        <Toaster richColors position="top-right" />
        <AppRoutes />
      </Router>
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
          {/* rota para redefinição de senha via e-mail do Supabase */}
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* rota explícita de login */}
          <Route path="/login" element={<Login />} />
          {/* fallback para qualquer outra rota não autenticada */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Suspense>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        {/* ⬇️ Atalhos globais (g d, g f, g i, g m, g c, Shift+/? para ajuda) */}
        <AppHotkeys />

        <Suspense fallback={<RouteLoader />}>

          <Routes>
            {/* redirect raiz */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Finanças */}
            <Route path="/financas/mensal" element={<FinancasMensal />} />
            <Route path="/financas/anual"  element={<FinancasAnual />} />

            {/* Investimentos */}
            <Route path="/investimentos"               element={<Investimentos />} />
            {/* (opcional) redireciona /investments → /investimentos */}
            <Route path="/investments" element={<Navigate to="/investimentos" replace />} />
            <Route path="/investimentos/renda-fixa" element={<CarteiraRendaFixa />} />
            <Route path="/investimentos/fiis"       element={<CarteiraFIIs />} />
            <Route path="/investimentos/bolsa"      element={<CarteiraBolsa />} />
            <Route path="/investimentos/cripto"     element={<CarteiraCripto />} />

            {/* Metas & Projetos */}
            <Route path="/metas" element={<Metas />} />

            {/* Milhas */}
            <Route path="/milhas/livelo"    element={<MilhasLivelo />} />
            <Route path="/milhas/latampass" element={<MilhasLatam />} />
            <Route path="/milhas/azul"      element={<MilhasAzul />} />

            {/* Listas */}
            <Route path="/lista-desejos" element={<ListaDesejos />} />
            <Route path="/lista-compras" element={<ListaCompras />} />

            {/* Configurações */}
            <Route path="/configuracoes" element={<Configuracoes />} />

            {/* 404 */}
            <Route path="*" element={<h1>Página não encontrada (404)</h1>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}