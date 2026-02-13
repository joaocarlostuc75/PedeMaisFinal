
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { LandingPage } from './pages/LandingPage';
import { PublicShop } from './pages/PublicShop';
import { Checkout } from './pages/Checkout';
import { EntregadorDashboard } from './pages/EntregadorDashboard';
import { LojistaDashboard } from './pages/LojistaDashboard';
import { LojistaEntregadores } from './pages/LojistaEntregadores';
import { LojistaRelatorio } from './pages/LojistaRelatorio';
import { LojistaConfig } from './pages/LojistaConfig';
import { LojistaHorarios } from './pages/LojistaHorarios';
import { LojistaAreasEntrega } from './pages/LojistaAreasEntrega';
import { SuperAdminLojas } from './pages/SuperAdminLojas';
import { SuperAdminPlanos } from './pages/SuperAdminPlanos';
import { SuperAdminEntregadores } from './pages/SuperAdminEntregadores';
import { Onboarding } from './pages/Onboarding';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';

const HeaderMobile = () => {
  const location = useLocation();
  const isPublic = location.pathname.startsWith('/loja/') || location.pathname.startsWith('/checkout') || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/onboarding';
  if (isPublic) return null;

  return (
    <div className="lg:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-40">
      <h1 className="text-xl font-black text-emerald-700 tracking-tighter">PEDE MAIS</h1>
      <button className="text-gray-400 p-2" title="Abrir menu lateral">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isPublic = location.pathname.startsWith('/loja/') || location.pathname.startsWith('/checkout') || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/onboarding';

  if (isPublic) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <HeaderMobile />
        <main className="flex-1 p-6 md:p-8 lg:ml-64 transition-all">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/loja/:slug" element={<PublicShop />} />
          <Route path="/checkout/:slug" element={<Checkout />} />
          
          <Route path="/entregador/dashboard" element={<EntregadorDashboard />} />
          
          <Route path="/admin/dashboard" element={<LojistaDashboard />} />
          <Route path="/admin/entregadores" element={<LojistaEntregadores />} />
          <Route path="/admin/relatorio" element={<LojistaRelatorio />} />
          <Route path="/admin/configuracoes" element={<LojistaConfig />} />
          <Route path="/admin/horarios" element={<LojistaHorarios />} />
          <Route path="/admin/areas-entrega" element={<LojistaAreasEntrega />} />
          
          <Route path="/super-admin/lojas" element={<SuperAdminLojas />} />
          <Route path="/super-admin/planos" element={<SuperAdminPlanos />} />
          <Route path="/super-admin/entregadores" element={<SuperAdminEntregadores />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
