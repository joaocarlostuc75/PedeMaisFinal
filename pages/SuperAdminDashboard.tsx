
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';

export const SuperAdminDashboard = () => {
  const { entregadores, lojas } = useStore();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Filtra dados REAIS (exclui loja demo 'l1')
  const realLojas = lojas.filter(l => l.id !== 'l1');
  const realEntregadores = entregadores.filter(e => e.lojaId !== 'l1');

  // Lógica de Paginação usando dados reais
  const totalPages = Math.ceil(realEntregadores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntregadores = realEntregadores.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Cálculos baseados em dados reais
  const totalLojasReais = realLojas.length;
  const lojasInadimplentes = realLojas.filter(l => l.statusAssinatura === 'cancelado').length; // Exemplo simples
  const totalEntregadoresReais = realEntregadores.length;
  const receitaMensalEstimada = realLojas.reduce((acc, l) => acc + (l.stats?.mrr || 0), 0);

  const kpis = [
    { label: 'Lojas Ativas', value: totalLojasReais.toString(), change: '+ 12%', icon: '🏪', trend: 'up' },
    { label: 'Lojas Canceladas', value: lojasInadimplentes.toString(), alert: 'Atenção', icon: '⚠️', trend: 'down' },
    { label: 'Total Entregadores', value: totalEntregadoresReais.toString(), change: 'Base Real', icon: '🚚', trend: 'up' },
    { label: 'Receita Mensal (MRR)', value: formatCurrency(receitaMensalEstimada), change: 'Recorrente', icon: '💰', trend: 'up' },
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
                  {kpi.trend === 'up' ? '↗' : '↘'} {kpi.change}
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
            <p className="text-sm text-gray-400 font-medium">Gerencie entregadores em todas as instâncias registradas (Exceto Demo).</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
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
                <th className="p-6">Nível</th>
                <th className="p-6">Status</th>
                <th className="p-6">Tipo de Veículo</th>
                <th className="p-6">Data de Adesão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentEntregadores.map(e => {
                const loja = lojas.find(l => l.id === e.lojaId);
                return (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6 flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 text-xs overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?u=${e.id}`} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{e.nome}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ID: #{e.id.slice(0,6)}</p>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="font-bold text-gray-700 text-sm">{loja?.nome || 'Loja Desconhecida'}</p>
                      <p className="text-[10px] font-medium text-gray-400">{loja?.categoria || 'Geral'}</p>
                    </td>
                    <td className="p-6">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${e.nivel === 'Diamante' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'}`}>
                         {e.nivel}
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
                );
              })}
              {currentEntregadores.length === 0 && (
                  <tr>
                      <td colSpan={6} className="p-10 text-center text-gray-400 font-bold text-sm">
                          Nenhum entregador real encontrado na base de dados.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Mostrando {realEntregadores.length > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + ITEMS_PER_PAGE, realEntregadores.length)} de {realEntregadores.length} entregadores reais
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
              disabled={currentPage === totalPages || totalPages === 0}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
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
