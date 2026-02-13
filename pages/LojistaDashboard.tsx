
import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Link } from 'react-router-dom';

export const LojistaDashboard = () => {
  const { lojas } = useStore();
  const minhaLoja = lojas[0];

  const stats = [
    { label: 'Pedidos Hoje', value: '24', icon: '📦', color: 'bg-blue-100 text-blue-600' },
    { label: 'Faturamento Hoje', value: formatCurrency(1450.00), icon: '💰', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Novos Clientes', value: '12', icon: '👥', color: 'bg-purple-100 text-purple-600' },
    { label: 'Entregadores Online', value: '4', icon: '🛵', color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900">Painel do Lojista</h1>
        <p className="text-gray-500 mt-2">Bem-vindo à gestão da sua loja: <span className="font-bold text-emerald-600">{minhaLoja.nome}</span></p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
              {s.icon}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-3xl font-black text-gray-800">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black mb-6">Pedidos Recentes</h3>
            <div className="space-y-4">
              {[1, 2, 3].map(id => (
                <div key={id} className="flex justify-between items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400">#0{id}</div>
                    <div>
                      <p className="font-bold text-gray-800">Cliente Exemplo {id}</p>
                      <p className="text-xs text-gray-400">Há {id * 5} minutos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-600">{formatCurrency(45.90 + id)}</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase">Pronto</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-emerald-900 text-white rounded-[2.5rem] p-8 shadow-xl">
            <h3 className="text-xl font-black mb-4">Seu Link na Bio</h3>
            <p className="text-emerald-100/60 text-sm mb-6">Compartilhe o link da sua loja nas redes sociais para converter mais vendas.</p>
            <div className="bg-white/10 p-4 rounded-2xl mb-6 font-mono text-sm break-all">
              pedemais.app/loja/{minhaLoja.slug}
            </div>
            <Link 
              to={`/loja/${minhaLoja.slug}`} 
              target="_blank"
              className="block w-full bg-emerald-500 hover:bg-emerald-400 text-center py-4 rounded-xl font-black transition-colors"
            >
              VISUALIZAR LOJA
            </Link>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-4">Atalhos</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/entregadores" className="bg-gray-50 p-4 rounded-2xl text-center hover:bg-emerald-50 transition-colors">
                <span className="block text-2xl mb-1">🛵</span>
                <span className="text-xs font-bold text-gray-600 uppercase">Frota</span>
              </Link>
              <Link to="/admin/relatorio" className="bg-gray-50 p-4 rounded-2xl text-center hover:bg-emerald-50 transition-colors">
                <span className="block text-2xl mb-1">📊</span>
                <span className="text-xs font-bold text-gray-600 uppercase">Ganhos</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
