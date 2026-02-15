
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useStore } from './store';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { PublicShop } from './pages/PublicShop';
import { Checkout } from './pages/Checkout';
import { EntregadorDashboard } from './pages/EntregadorDashboard';
import { LojistaDashboard } from './pages/LojistaDashboard';
import { LojistaPedidos } from './pages/LojistaPedidos';
import { LojistaEntregadores } from './pages/LojistaEntregadores';
import { LojistaRelatorio } from './pages/LojistaRelatorio';
import { LojistaConfig } from './pages/LojistaConfig';
import { LojistaHorarios } from './pages/LojistaHorarios';
import { LojistaAreasEntrega } from './pages/LojistaAreasEntrega';
import { LojistaAssinatura } from './pages/LojistaAssinatura';
import { LojistaProdutos } from './pages/LojistaProdutos';
import { LojistaSuporte } from './pages/LojistaSuporte';
import { SuperAdminLojas } from './pages/SuperAdminLojas';
import { SuperAdminPlanos } from './pages/SuperAdminPlanos';
import { SuperAdminEntregadores } from './pages/SuperAdminEntregadores';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { SuperAdminRelatorios } from './pages/SuperAdminRelatorios';
import { SuperAdminUsuarios } from './pages/SuperAdminUsuarios';
import { SuperAdminConfig } from './pages/SuperAdminConfig';
import { SuperAdminSuporte } from './pages/SuperAdminSuporte';
import { Onboarding } from './pages/Onboarding';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { Sidebar } from './components/Sidebar';

const HeaderMobile = () => {
  const { toggleSidebar } = useStore();
  const location = useLocation();
  const isPublic = location.pathname.startsWith('/loja/') || location.pathname.startsWith('/checkout') || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/onboarding' || location.pathname === '/politica-privacidade' || location.pathname === '/termos-uso';
  if (isPublic) return null;

  return (
    <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center fixed top-0 left-0 w-full z-40 shadow-sm h-16">
      <h1 className="text-lg font-black text-emerald-700 tracking-tighter">PEDE MAIS</h1>
      <button onClick={toggleSidebar} className="text-gray-500 p-2 bg-gray-50 rounded-lg active:bg-gray-100" title="Abrir menu lateral">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>
  );
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isPublic = location.pathname.startsWith('/loja/') || location.pathname.startsWith('/checkout') || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/onboarding' || location.pathname === '/politica-privacidade' || location.pathname === '/termos-uso';

  if (isPublic) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      {/* Wrapper principal: Sem padding manual. Flexbox cuida do espaço. */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300"> 
        <HeaderMobile />
        {/* Main Content: padding-top no mobile para acomodar header fixo */}
        <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-x-hidden overflow-y-auto h-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/loja/:slug" element={<PublicShop />} />
          <Route path="/checkout/:slug" element={<Checkout />} />
          
          {/* Legal Pages */}
          <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
          <Route path="/termos-uso" element={<TermsOfUse />} />
          
          {/* Entregador Routes */}
          <Route path="/entregador/dashboard" element={<EntregadorDashboard />} />
          
          {/* Lojista Routes */}
          <Route path="/admin/dashboard" element={<LojistaDashboard />} />
          <Route path="/admin/pedidos" element={<LojistaPedidos />} />
          <Route path="/admin/produtos" element={<LojistaProdutos />} />
          <Route path="/admin/assinatura" element={<LojistaAssinatura />} />
          <Route path="/admin/entregadores" element={<LojistaEntregadores />} />
          <Route path="/admin/relatorio" element={<LojistaRelatorio />} />
          <Route path="/admin/configuracoes" element={<LojistaConfig />} />
          <Route path="/admin/horarios" element={<LojistaHorarios />} />
          <Route path="/admin/areas-entrega" element={<LojistaAreasEntrega />} />
          <Route path="/admin/suporte" element={<LojistaSuporte />} />
          
          {/* Super Admin Routes */}
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/lojas" element={<SuperAdminLojas />} />
          <Route path="/super-admin/planos" element={<SuperAdminPlanos />} />
          <Route path="/super-admin/entregadores" element={<SuperAdminEntregadores />} />
          <Route path="/super-admin/relatorios" element={<SuperAdminRelatorios />} />
          <Route path="/super-admin/usuarios" element={<SuperAdminUsuarios />} />
          <Route path="/super-admin/configuracoes" element={<SuperAdminConfig />} />
          <Route path="/super-admin/suporte" element={<SuperAdminSuporte />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
