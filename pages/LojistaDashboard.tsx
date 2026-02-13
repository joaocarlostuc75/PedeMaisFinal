
import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Link, useNavigate } from 'react-router-dom';

export const LojistaDashboard = () => {
  const navigate = useNavigate();
  const { lojas, entregas, entregadores, user } = useStore();
  
  // Busca a loja do usuário logado ou usa a primeira como fallback (demo)
  const minhaLoja = user?.lojaId ? lojas.find(l => l.id === user.lojaId) || lojas[0] : lojas[0];
  const isDemo = user?.id === 'demo-user';

  // Cálculo de estatísticas reais para a loja específica
  const hoje = new Date().toDateString();
  const pedidosHoje = entregas.filter(e => new Date(e.data).toDateString() === hoje && e.lojaId === minhaLoja.id);
  const faturamentoHoje = pedidosHoje.reduce((acc, curr) => acc + curr.valor, 0);
  const entregadoresOnline = entregadores.filter(e => e.lojaId === minhaLoja.id && e.status === 'disponível').length;

  const stats = [
    { label: 'Pedidos Hoje', value: pedidosHoje.length.toString(), icon: '📦', color: 'bg-blue-100 text-blue-600' },
    { label: 'Faturamento Hoje', value: formatCurrency(faturamentoHoje), icon: '💰', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Novos Clientes', value: '0', icon: '👥', color: 'bg-purple-100 text-purple-600' }, // Mockado
    { label: 'Entregadores Online', value: entregadoresOnline.toString(), icon: '🛵', color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto w-full pb-10">
      
      {/* Banner Modo Demo - Redesenhado para não sobrepor */}
      {isDemo && (
        <div className="bg-gray-900 rounded-[2rem] p-8 mb-10 shadow-2xl relative overflow-hidden group">
            {/* Efeitos de Fundo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-[120px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-amber-500 text-gray-900 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                        <span>🚧</span> Ambiente de Simulação
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                        Você está no comando do <span className="text-emerald-400">Pede Mais.</span>
                    </h2>
                    <p className="text-gray-400 font-medium text-sm md:text-base leading-relaxed">
                        Este é um ambiente seguro para testes. Explore funcionalidades, gerencie pedidos fictícios e veja como sua operação pode escalar. 
                        <span className="text-white font-bold block mt-1">Dados criados aqui não serão salvos.</span>
                    </p>
                </div>
                
                <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
                    <button 
                        onClick={() => navigate('/onboarding')}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-1 active:scale-95 text-center flex items-center justify-center gap-3"
                    >
                        <span>🚀</span> CRIAR MINHA LOJA REAL
                    </button>
                    <p className="text-[10px] text-gray-500 text-center font-bold uppercase tracking-widest">Teste grátis por 7 dias</p>
                </div>
            </div>
        </div>
      )}

      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">Painel do Lojista</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Bem-vindo à gestão da sua loja: <span className="font-bold text-emerald-600 block md:inline">{minhaLoja.nome}</span></p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
              {s.icon}
            </div>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-2xl md:text-3xl font-black text-gray-800">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg md:text-xl font-black text-gray-900">Pedidos Recentes</h3>
                <Link to="/admin/pedidos" className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">Ver todos</Link>
            </div>
            <div className="space-y-4">
              {pedidosHoje.slice(0, 3).length > 0 ? pedidosHoje.slice(0, 3).map((pedido, idx) => (
                <div key={pedido.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 gap-3">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xs md:text-sm">#{pedido.id.slice(-4)}</div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm md:text-base">{pedido.clienteNome}</p>
                      <p className="text-[10px] md:text-xs text-gray-400">Há {Math.floor((new Date().getTime() - new Date(pedido.data).getTime()) / 60000)} minutos</p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto flex justify-between sm:block items-center">
                    <p className="font-black text-emerald-600 text-sm md:text-base">{formatCurrency(pedido.valor)}</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase sm:mt-1 inline-block">{pedido.status}</span>
                  </div>
                </div>
              )) : (
                 <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-300 text-4xl mb-3">📭</p>
                    <p className="text-gray-400 text-sm font-bold">Nenhum pedido hoje ainda.</p>
                    <p className="text-gray-300 text-xs mt-1">Compartilhe seu link para começar a vender!</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#112644] text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20" />
            <h3 className="text-lg md:text-xl font-black mb-4 relative z-10">Seu Link na Bio</h3>
            <p className="text-blue-200 text-sm mb-6 relative z-10">Compartilhe o link da sua loja nas redes sociais para converter mais vendas.</p>
            <div className="bg-white/10 p-4 rounded-2xl mb-6 font-mono text-xs md:text-sm break-all border border-white/10 relative z-10">
              pedemais.app/loja/{minhaLoja.slug}
            </div>
            <Link 
              to={`/loja/${minhaLoja.slug}`} 
              target="_blank"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-center py-4 rounded-xl font-black transition-colors text-sm uppercase tracking-widest relative z-10 shadow-lg"
            >
              VISUALIZAR LOJA
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-4">Atalhos Rápidos</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/entregadores" className="bg-gray-50 p-4 rounded-2xl text-center hover:bg-emerald-50 hover:text-emerald-700 transition-colors group">
                <span className="block text-2xl mb-2 group-hover:scale-110 transition-transform">🛵</span>
                <span className="text-xs font-bold text-gray-600 uppercase group-hover:text-emerald-700">Frota</span>
              </Link>
              <Link to="/admin/configuracoes" className="bg-gray-50 p-4 rounded-2xl text-center hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                <span className="block text-2xl mb-2 group-hover:scale-110 transition-transform">⚙️</span>
                <span className="text-xs font-bold text-gray-600 uppercase group-hover:text-blue-700">Config</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
