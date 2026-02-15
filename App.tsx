
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useStore } from './store';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { PublicShop } from './pages/PublicShop';
import { Checkout } from './pages/Checkout';
import { EntregadorDashboard } from './pages/EntregadorDashboard';
import { LojistaDashboard } from './pages/LojistaDashboard';
import { LojistaPedidos } from './pages/LojistaPedidos';
import { LojistaClientes } from './pages/LojistaClientes';
import { LojistaFuncionarios } from './pages/LojistaFuncionarios'; // Nova Importação
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
import { CustomerOrders } from './pages/CustomerOrders';
import { OrderTracking } from './pages/OrderTracking';
import { ProtectedRoute } from './components/ProtectedRoute';

const HeaderMobile = () => {
  const { toggleSidebar } = useStore();
  const location = useLocation();
  const isPublic = location.pathname.startsWith('/loja/') || location.pathname.startsWith('/checkout') || location.pathname.startsWith('/meus-pedidos') || location.pathname.startsWith('/rastreio') || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/onboarding' || location.pathname === '/politica-privacidade' || location.pathname === '/termos-uso';
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
  const isPublic = location.pathname.startsWith('/loja/') || location.pathname.startsWith('/checkout') || location.pathname.startsWith('/meus-pedidos') || location.pathname.startsWith('/rastreio') || location.pathname === '/' || location.pathname === '/login' || location.pathname === '/onboarding' || location.pathname === '/politica-privacidade' || location.pathname === '/termos-uso';

  if (isPublic) return <>{children}</>;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      {/* Wrapper principal */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300"> 
        <HeaderMobile />
        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-x-hidden overflow-y-auto h-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <Router>
        <ToastContainer />
        <Layout>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/loja/:slug" element={<PublicShop />} />
            <Route path="/checkout/:slug" element={<Checkout />} />
            <Route path="/meus-pedidos" element={<CustomerOrders />} />
            <Route path="/rastreio/:id" element={<OrderTracking />} />
            <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
            <Route path="/termos-uso" element={<TermsOfUse />} />
            
            {/* Rotas de Entregador (Protegidas) */}
            <Route path="/entregador/dashboard" element={
              <ProtectedRoute allowedRoles={['entregador']}>
                <EntregadorDashboard />
              </ProtectedRoute>
            } />
            
            {/* Rotas de Lojista (Protegidas) */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaDashboard /></ProtectedRoute>} />
            <Route path="/admin/pedidos" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaPedidos /></ProtectedRoute>} />
            <Route path="/admin/produtos" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaProdutos /></ProtectedRoute>} />
            <Route path="/admin/clientes" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaClientes /></ProtectedRoute>} />
            <Route path="/admin/funcionarios" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaFuncionarios /></ProtectedRoute>} /> {/* Nova Rota */}
            <Route path="/admin/assinatura" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaAssinatura /></ProtectedRoute>} />
            <Route path="/admin/entregadores" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaEntregadores /></ProtectedRoute>} />
            <Route path="/admin/relatorio" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaRelatorio /></ProtectedRoute>} />
            <Route path="/admin/configuracoes" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaConfig /></ProtectedRoute>} />
            <Route path="/admin/horarios" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaHorarios /></ProtectedRoute>} />
            <Route path="/admin/areas-entrega" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaAreasEntrega /></ProtectedRoute>} />
            <Route path="/admin/suporte" element={<ProtectedRoute allowedRoles={['lojista']}><LojistaSuporte /></ProtectedRoute>} />
            
            {/* Rotas de Super Admin (Protegidas) */}
            <Route path="/super-admin/dashboard" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/super-admin/lojas" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminLojas /></ProtectedRoute>} />
            <Route path="/super-admin/planos" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminPlanos /></ProtectedRoute>} />
            <Route path="/super-admin/entregadores" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminEntregadores /></ProtectedRoute>} />
            <Route path="/super-admin/relatorios" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminRelatorios /></ProtectedRoute>} />
            <Route path="/super-admin/usuarios" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminUsuarios /></ProtectedRoute>} />
            <Route path="/super-admin/configuracoes" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminConfig /></ProtectedRoute>} />
            <Route path="/super-admin/suporte" element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminSuporte /></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </HelmetProvider>
  );
};

export default App;
