
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store';

export const Sidebar = () => {
  const { user, setUser, isSidebarOpen, closeSidebar, lojas, entregas } = useStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Encontra a loja do usuário atual para exibir no perfil
  const userLoja = user?.lojaId ? lojas.find(l => l.id === user.lojaId) : null;
  const isDemo = user?.id === 'demo-user';

  const handleLogout = () => {
    setUser(null);
    closeSidebar();
    navigate('/');
  };

  // Calcula pedidos pendentes apenas para a loja do usuário atual
  const pedidosPendentes = user?.lojaId 
    ? entregas.filter(e => e.lojaId === user.lojaId && e.status === 'pendente').length 
    : 0;

  const menuItems = {
    super_admin: [
      { label: 'Dashboard', path: '/super-admin/dashboard', icon: '📊' },
      { label: 'Lojas', path: '/super-admin/lojas', icon: '🏬' },
      { label: 'Usuários', path: '/super-admin/usuarios', icon: '👥' },
      { label: 'Entregadores', path: '/super-admin/entregadores', icon: '🛵' },
      { label: 'Métricas', path: '/super-admin/relatorios', icon: '📈' },
      { label: 'Planos', path: '/super-admin/planos', icon: '💳' },
      { label: 'Suporte', path: '/super-admin/suporte', icon: '🎧' },
      { label: 'Configurações', path: '/super-admin/configuracoes', icon: '⚙️' },
    ],
    lojista: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: '🏠' },
      // Badge dinâmica: só mostra se houver pedidos pendentes (> 0)
      { label: 'Pedidos', path: '/admin/pedidos', icon: '🛍️', badge: pedidosPendentes > 0 ? pedidosPendentes : undefined },
      { label: 'Cardápio', path: '/admin/produtos', icon: '🍔' },
      { label: 'Clientes', path: '/admin/clientes', icon: '👥' },
      { label: 'Funcionários', path: '/admin/funcionarios', icon: '👔' }, // Novo Link
      { label: 'Entregadores', path: '/admin/entregadores', icon: '🛵' },
      { label: 'Assinatura', path: '/admin/assinatura', icon: '💳' },
      { label: 'Configurações', path: '/admin/configuracoes', icon: '⚙️' },
      { label: 'Horários', path: '/admin/horarios', icon: '🕒' },
      { label: 'Áreas de Entrega', path: '/admin/areas-entrega', icon: '🗺️' },
      { label: 'Suporte', path: '/admin/suporte', icon: '🎧' },
    ],
    entregador: [
      { label: 'Entregas', path: '/entregador/dashboard', icon: '🛵' },
    ],
    cliente: []
  };

  const activeItems = user ? menuItems[user.role] : [];

  return (
    <>
      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeSidebar} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#112644] text-white flex flex-col transition-transform duration-300
        lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 lg:shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#112644] text-xl font-black">P</div>
            <h1 className="text-xl font-black tracking-tighter">Pede Mais</h1>
          </div>
          <button onClick={closeSidebar} className="lg:hidden text-white/50 hover:text-white">✕</button>
        </div>

        {/* Demo Badge */}
        {isDemo && (
            <div className="px-6 pb-4 shrink-0">
                <div className="bg-amber-500/20 border border-amber-500/50 p-3 rounded-xl text-center">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Ambiente de Teste</p>
                    <p className="text-[9px] text-white/60 leading-tight">Dados não serão salvos permanentemente.</p>
                </div>
            </div>
        )}

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pt-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-6 mb-4">Geral</p>
          {activeItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center justify-between px-6 py-3.5 rounded-2xl font-bold transition-all ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                 <span className="bg-emerald-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">{item.badge}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-6 shrink-0">
          <div className="flex items-center gap-4 px-4 py-2">
             <div className="w-10 h-10 bg-gray-600 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                {user?.avatar ? (
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                    <img src={`https://i.pravatar.cc/100?u=${user?.id}`} alt="" className="w-full h-full object-cover" />
                )}
             </div>
             <div className="overflow-hidden">
                <p className="text-xs font-black truncate">{user?.nome}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase truncate">{user?.role.replace('_', ' ')}</p>
                {userLoja && (
                    <p className="text-[9px] text-emerald-400 font-bold uppercase truncate mt-0.5">{userLoja.nome}</p>
                )}
             </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-sm text-gray-400 hover:bg-red-500 hover:text-white transition-all group"
          >
            <span className="group-hover:translate-x-1 transition-transform">🚪</span> Sair
          </button>
        </div>
      </aside>
    </>
  );
};
