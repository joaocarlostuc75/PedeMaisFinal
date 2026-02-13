
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
      {/* Banner Modo Demo */}
      {isDemo && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 mb-8 md:mb-12 shadow-2xl relative overflow-hidden text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 animate-bounce-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
            <div className="relative z-10 w-full">
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/50 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">
                    <span>🚧</span> Modo Simulação
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">Experimente o poder do Pede Mais</h2>
                <p className="text-white/60 font-medium text-sm mt-2 max-w-xl">
                    Você está acessando uma loja fictícia. Sinta-se à vontade para editar configurações, despachar pedidos e explorar. 
                    <strong className="text-white block mt-1"> Nenhuma alteração será salva permanentemente.</strong>
                </p>
            </div>
            <button 
                onClick={() => navigate('/onboarding')}
                className="relative z-10 w-full lg:w-auto bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-4 rounded-xl font-black shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-1 active:scale-95 whitespace-nowrap text-sm md:text-base text-center"
            >
                CRIAR MINHA LOJA REAL
            </button>
        </div>
      )}

      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">Painel do Lojista</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Bem-vindo à gestão da sua loja: <span className="font-bold text-emerald-600 block md:inline">{minhaLoja.nome}</span></p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm">
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
            <h3 className="text-lg md:text-xl font-black mb-6">Pedidos Recentes</h3>
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
                 <div className="text-center py-10">
                    <p className="text-gray-300 text-4xl mb-3">📭</p>
                    <p className="text-gray-400 text-sm font-bold">Nenhum pedido hoje ainda.</p>
                    <p className="text-gray-300 text-xs mt-1">Compartilhe seu link para começar a vender!</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-emerald-900 text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl">
            <h3 className="text-lg md:text-xl font-black mb-4">Seu Link na Bio</h3>
            <p className="text-emerald-100/60 text-sm mb-6">Compartilhe o link da sua loja nas redes sociais para converter mais vendas.</p>
            <div className="bg-white/10 p-4 rounded-2xl mb-6 font-mono text-xs md:text-sm break-all">
              pedemais.app/loja/{minhaLoja.slug}
            </div>
            <Link 
              to={`/loja/${minhaLoja.slug}`} 
              target="_blank"
              className="block w-full bg-emerald-500 hover:bg-emerald-400 text-center py-4 rounded-xl font-black transition-colors text-sm uppercase tracking-widest"
            >
              VISUALIZAR LOJA
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-4">Atalhos</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/entregadores" className="bg-gray-50 p-4 rounded-2xl text-center hover:bg-emerald-50 transition-colors">
                <span className="block text-2xl mb-1">🛵</span>
                <span className="text-xs font-bold text-gray-600 uppercase">Frota</span>
              </Link>
              <Link to="/admin/configuracoes" className="bg-gray-50 p-4 rounded-2xl text-center hover:bg-emerald-50 transition-colors">
                <span className="block text-2xl mb-1">⚙️</span>
                <span className="text-xs font-bold text-gray-600 uppercase">Config</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
