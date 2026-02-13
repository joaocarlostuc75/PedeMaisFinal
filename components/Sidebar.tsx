
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export const Sidebar = () => {
  const { user, setUser } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const menuItems = {
    super_admin: [
      { label: 'Lojas', path: '/super-admin/lojas', icon: '🏬' },
      { label: 'SaaS Insight', path: '/super-admin/relatorios', icon: '📊' },
      { label: 'Planos', path: '/super-admin/planos', icon: '💳' },
      { label: 'Frota Global', path: '/super-admin/entregadores', icon: '🌎' },
    ],
    lojista: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
      { label: 'Pedidos', path: '/admin/pedidos', icon: '🛍️', badge: 3 },
      { label: 'Produtos', path: '/admin/produtos', icon: '📦' },
      { label: 'Configurações', path: '/admin/configuracoes', icon: '⚙️' },
      { label: 'Horários', path: '/admin/horarios', icon: '🕒' },
      { label: 'Áreas de Entrega', path: '/admin/areas-entrega', icon: '🗺️' },
      { label: 'Entregadores', path: '/admin/entregadores', icon: '🛵' },
      { label: 'Relatórios', path: '/admin/relatorio', icon: '📊' },
    ],
    entregador: [
      { label: 'Entregas', path: '/entregador/dashboard', icon: '🛵' },
    ],
    cliente: []
  };

  const activeItems = user ? menuItems[user.role] : [];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white text-xl font-black">M</div>
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tighter">Minha Loja</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
        {activeItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all ${
              location.pathname === item.path
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </div>
            {item.badge && (
               <span className="bg-emerald-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"
        >
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  );
};
