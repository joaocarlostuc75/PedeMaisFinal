
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';

export const SuperAdminEntregadores = () => {
  const { entregadores, lojas } = useStore();
  const [suspensoIds, setSuspensoIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Filtrar apenas entregadores de lojas REAIS (exclui loja 'l1')
  const realEntregadores = entregadores.filter(e => e.lojaId !== 'l1');

  const totalPages = Math.ceil(realEntregadores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentEntregadores = realEntregadores.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSuspensao = (id: string) => {
    if (suspensoIds.includes(id)) {
      setSuspensoIds(suspensoIds.filter(sid => sid !== id));
    } else {
      setSuspensoIds([...suspensoIds, id]);
    }
  };

  const totalEntregas = realEntregadores.reduce((acc, curr) => acc + curr.entregasHoje, 0);
  const totalRepassado = realEntregadores.reduce((acc, curr) => acc + curr.saldo, 0);

  return (
    <div className="max-w-7xl mx-auto p-8 animate-fade-in space-y-12">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">REDE GLOBAL DE ENTREGADORES</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-emerald-600 text-white p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute -top-4 -right-4 text-white/10 text-8xl font-black">🌍</div>
          <p className="text-emerald-100 font-bold text-[10px] uppercase tracking-widest mb-2">Total de Agentes (Reais)</p>
          <h3 className="text-6xl font-black">{realEntregadores.length}</h3>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Entregas Hoje</p>
          <h3 className="text-6xl font-black text-gray-800">{totalEntregas}</h3>
        </div>
        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">Volume Repassado</p>
          <h3 className="text-6xl font-black text-emerald-600 tracking-tighter">{formatCurrency(totalRepassado)}</h3>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="p-8">Identidade</th>
                <th className="p-8">Unidade Vinculada</th>
                <th className="p-8">Desempenho</th>
                <th className="p-8">Total Repassado</th>
                <th className="p-8 text-right">Controle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentEntregadores.map(e => {
                const loja = lojas.find(l => l.id === e.lojaId);
                const estaSuspenso = suspensoIds.includes(e.id);
                return (
                  <tr key={e.id} className={`hover:bg-gray-50/50 transition-colors ${estaSuspenso ? 'opacity-50 grayscale' : ''}`}>
                    <td className="p-8">
                      <div className="font-black text-gray-900 text-lg">{e.nome}</div>
                      <div className="text-sm font-bold text-gray-400">{e.telefone}</div>
                    </td>
                    <td className="p-8">
                      <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black uppercase">{loja?.nome || 'Desconhecida'}</span>
                    </td>
                    <td className="p-8">
                      <div className="font-black text-gray-800">{e.entregasHoje} <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">hoje</span></div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{e.entregasTotal} total</div>
                    </td>
                    <td className="p-8">
                      <div className="text-emerald-600 font-black text-lg tracking-tighter">{formatCurrency(e.saldo)}</div>
                    </td>
                    <td className="p-8 text-right">
                      <button 
                        onClick={() => toggleSuspensao(e.id)}
                        className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${estaSuspenso ? 'bg-emerald-600 text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}
                      >
                        {estaSuspenso ? 'REATIVAR AGENTE' : 'SUSPENDER ENTREGADOR'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {currentEntregadores.length === 0 && (
                  <tr>
                      <td colSpan={5} className="p-10 text-center text-gray-400 font-bold text-sm">
                          Nenhum entregador encontrado em lojas reais.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Mostrando {realEntregadores.length > 0 ? startIndex + 1 : 0} a {Math.min(startIndex + ITEMS_PER_PAGE, realEntregadores.length)} de {realEntregadores.length} entregadores
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'bg-white border border-gray-100 text-gray-600 hover:border-emerald-500 hover:text-emerald-700'}`}
            >
              Anterior
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentPage === totalPages || totalPages === 0 ? 'text-gray-300 cursor-not-allowed' : 'bg-white border border-gray-100 text-gray-600 hover:border-emerald-500 hover:text-emerald-700'}`}
            >
              Próximo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
