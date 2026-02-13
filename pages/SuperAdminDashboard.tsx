
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';

export const SuperAdminDashboard = () => {
  const { entregadores } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Lógica de Paginação
  const totalPages = Math.ceil(entregadores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntregadores = entregadores.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const kpis = [
    { label: 'Lojas Ativas', value: '1.240', change: '+ 12%', icon: '🏪', trend: 'up' },
    { label: 'Lojas Inadimplentes', value: '12', alert: 'Ação necessária', icon: '⚠️', trend: 'down' },
    { label: 'Total Entregadores', value: '5.850', change: '+ 234 esta semana', icon: '🚚', trend: 'up' },
    { label: 'Receita Mensal', value: '$420k', change: '+ 5.2%', icon: '💰', trend: 'up' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponível': return 'bg-emerald-100 text-emerald-700';
      case 'em_pausa': return 'bg-amber-100 text-amber-700';
      case 'suspenso': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'disponível': return 'Ativo';
      case 'em_pausa': return 'Em Pausa';
      case 'suspenso': return 'Suspenso';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Global</h1>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input type="text" placeholder="Busca global..." className="w-full bg-white border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
          <button className="relative p-2 text-gray-400 bg-white rounded-xl border border-gray-100">
            🔔 <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{kpi.label}</p>
                <h3 className="text-3xl font-black text-gray-800 mt-1">{kpi.value}</h3>
              </div>
              <div className="text-2xl bg-gray-50 p-3 rounded-xl">{kpi.icon}</div>
            </div>
            <div className="mt-4">
              {kpi.change ? (
                <span className={`text-xs font-bold ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {kpi.trend === 'up' ? '↗' : '↘'} {kpi.change} <span className="text-gray-300 ml-1">vs mês anterior</span>
                </span>
              ) : (
                <span className="text-xs font-black text-red-500 uppercase flex items-center gap-1">
                  ❗ {kpi.alert}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Driver Management Table */}
      <section className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">Gestão Global de Entregadores</h2>
            <p className="text-sm text-gray-400 font-medium">Gerencie entregadores em todas as instâncias registradas.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-600 outline-none">
              <option>Todos os Planos</option>
            </select>
            <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-600 outline-none">
              <option>Todos os Status</option>
            </select>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-blue-600/10 hover:bg-blue-700 transition-all">
               📥 Exportar Relatório
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="p-6">Nome do Entregador</th>
                <th className="p-6">Loja / Instância</th>
                <th className="p-6">Plano</th>
                <th className="p-6">Status</th>
                <th className="p-6">Tipo de Veículo</th>
                <th className="p-6">Data de Adesão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentEntregadores.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-6 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 text-xs overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${e.id}`} alt="" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{e.nome}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ID: #DRV-{e.id}</p>
                    </div>
                  </td>
                  <td className="p-6">
                    <p className="font-bold text-gray-700 text-sm">Padaria Pão Quente</p>
                    <p className="text-[10px] font-medium text-gray-400">Alimentação</p>
                  </td>
                  <td className="p-6">
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${e.nivel === 'Diamante' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>
                       {e.nivel === 'Diamante' ? 'Enterprise' : 'Starter'}
                     </span>
                  </td>
                  <td className="p-6">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(e.status)}`}>
                        {getStatusLabel(e.status)}
                     </span>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <span>🚚</span> {e.tipoVeiculo}
                    </div>
                  </td>
                  <td className="p-6 text-xs font-bold text-gray-400">
                    {formatDate(e.dataAdesao)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, entregadores.length)} de {entregadores.length} entregadores
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                {'<'}
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  {i + 1}
                </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                {'>'}
            </button>
          </div>
        </div>
      </section>

      <footer className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest pt-10">
        © 2024 Pede Mais SaaS Platform Inc. Versão 2.5.1
      </footer>
    </div>
  );
};
