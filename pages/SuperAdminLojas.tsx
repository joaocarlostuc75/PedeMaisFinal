
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { Link } from 'react-router-dom';

export const SuperAdminLojas = () => {
  const { lojas, planos, cancelarAssinatura, updatePlanoLoja, batchUpdatePlano } = useStore();
  const [selectedLoja, setSelectedLoja] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Filtragem das lojas com base na busca
  const filteredLojas = useMemo(() => {
    return lojas.filter(loja => 
      loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loja.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [lojas, searchTerm]);

  const totalPages = Math.ceil(filteredLojas.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLojas = filteredLojas.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === currentLojas.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentLojas.map(l => l.id));
    }
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1); // Volta para a primeira página ao buscar
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Gestão de Unidades</h1>
          <p className="text-gray-400 font-bold mt-2">Monitore e controle as assinaturas globais.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Link to="/super-admin/relatorios" className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all text-center">ESTATÍSTICAS</Link>
          <Link to="/super-admin/planos" className="bg-white border-2 border-gray-100 text-gray-700 px-8 py-4 rounded-2xl font-black hover:border-emerald-500 transition-all text-center">PLANOS</Link>
        </div>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input 
            type="text" 
            placeholder="Buscar por nome ou slug da loja..." 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-5 pl-14 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <span className="bg-gray-100 px-6 py-4 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest w-full text-center md:w-auto">
             Total: {filteredLojas.length}
           </span>
        </div>
      </div>

      {/* Barra de Ações em Massa */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-900 text-white p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between shadow-2xl animate-bounce-in gap-4">
          <div className="flex items-center gap-6">
             <span className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black">{selectedIds.length}</span>
             <p className="font-bold text-sm">Selecionadas nesta página</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
             <button onClick={() => batchUpdatePlano(selectedIds, '3')} className="bg-emerald-600 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-500 transition-all">UPGRADE PREMIUM</button>
             <button onClick={() => alert('Mensagem enviada!')} className="bg-white/10 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-white/20 transition-all">WHATSAPP</button>
             <button onClick={() => setSelectedIds([])} className="text-[10px] font-black text-white/40 uppercase px-4">CANCELAR</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <tr>
                <th className="p-8">
                    <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === currentLojas.length && currentLojas.length > 0} className="w-5 h-5 rounded accent-emerald-600" />
                </th>
                <th className="p-8">Loja / URL</th>
                <th className="p-8">Plano</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {currentLojas.map(loja => {
                const plano = planos.find(p => p.id === loja.planoId);
                const isSelected = selectedIds.includes(loja.id);
                return (
                    <tr key={loja.id} className={`group hover:bg-emerald-50/20 transition-colors ${isSelected ? 'bg-emerald-50/50' : ''}`}>
                    <td className="p-8">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(loja.id)} className="w-5 h-5 rounded accent-emerald-600" />
                    </td>
                    <td className="p-8">
                        <div className="font-black text-gray-800 text-lg">{loja.nome}</div>
                        <div className="text-xs font-bold text-emerald-600">pedemais.app/loja/{loja.slug}</div>
                    </td>
                    <td className="p-8">
                        <span className="bg-gray-100 px-4 py-1 rounded-full text-xs font-black text-gray-500 uppercase">{plano?.nome}</span>
                    </td>
                    <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${loja.statusAssinatura === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {loja.statusAssinatura}
                        </span>
                    </td>
                    <td className="p-8 text-right">
                        <div className="flex justify-end gap-2">
                        <button onClick={() => setSelectedLoja(loja.id)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Editar Loja">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => cancelarAssinatura(loja.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Suspender">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                        </button>
                        </div>
                    </td>
                    </tr>
                );
                })}
                {currentLojas.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-20 text-center">
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Nenhuma loja encontrada para esta busca.</p>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>

        {/* Paginação */}
        {totalPages > 0 && (
          <div className="p-6 md:p-8 bg-gray-50/50 border-t border-gray-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center md:text-left">
              Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredLojas.length)} de {filteredLojas.length} lojas
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 md:px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'bg-white border border-gray-100 text-gray-600 hover:border-emerald-500 hover:text-emerald-700'}`}
              >
                Anterior
              </button>
              <div className="flex gap-1 overflow-x-auto max-w-[150px] md:max-w-none no-scrollbar">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`min-w-[40px] h-10 rounded-lg font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 md:px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'bg-white border border-gray-100 text-gray-600 hover:border-emerald-500 hover:text-emerald-700'}`}
              >
                Próximo
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLoja && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl animate-bounce-in">
            <h3 className="text-2xl font-black mb-8">Alterar Plano</h3>
            <div className="space-y-4">
              {planos.map(p => (
                <button 
                  key={p.id} onClick={() => { updatePlanoLoja(selectedLoja, p.id); setSelectedLoja(null); }}
                  className="w-full p-6 bg-gray-50 rounded-[2rem] border-2 border-transparent hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
                >
                  <p className="font-black text-gray-800 group-hover:text-emerald-700">{p.nome}</p>
                  <p className="text-xs text-gray-400 font-bold">{formatCurrency(p.preco)}/mês</p>
                </button>
              ))}
            </div>
            <button onClick={() => setSelectedLoja(null)} className="w-full mt-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">FECHAR JANELA</button>
          </div>
        </div>
      )}
    </div>
  );
};
