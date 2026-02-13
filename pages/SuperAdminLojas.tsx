
import React, { useState, useMemo, useRef } from 'react';
import { useStore } from '../store';
import { formatCurrency, convertFileToBase64 } from '../utils';
import { Link } from 'react-router-dom';

export const SuperAdminLojas = () => {
  const { lojas, planos, updateLoja, deleteLoja, batchUpdatePlano, addNotification } = useStore();
  const [editingLoja, setEditingLoja] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  const logoInputRef = useRef<HTMLInputElement>(null);

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
    setCurrentPage(1); 
  };

  const openEditModal = (loja: any) => {
      setEditingLoja({ ...loja });
  };

  const handleSaveEdit = () => {
      if (editingLoja) {
          updateLoja(editingLoja.id, editingLoja);
          addNotification('success', 'Loja atualizada com sucesso!');
          setEditingLoja(null);
      }
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Tem certeza que deseja remover esta loja permanentemente?')) {
          deleteLoja(id);
          addNotification('info', 'Loja removida do sistema.');
      }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingLoja) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification('error', 'A imagem deve ter no máximo 2MB.');
        return;
      }
      try {
        const base64 = await convertFileToBase64(file);
        setEditingLoja({...editingLoja, logo: base64});
      } catch (err) {
        addNotification('error', 'Erro ao processar imagem.');
      }
    }
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
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                {loja.logo ? <img src={loja.logo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">🏪</div>}
                            </div>
                            <div>
                                <div className="font-black text-gray-800 text-lg">{loja.nome}</div>
                                <Link to={`/loja/${loja.slug}`} target="_blank" className="text-xs font-bold text-emerald-600 hover:underline">pedemais.app/loja/{loja.slug}</Link>
                            </div>
                        </div>
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
                        <Link to={`/loja/${loja.slug}`} target="_blank" className="p-3 bg-blue-50 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center" title="Ver Loja Pública">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <button onClick={() => openEditModal(loja)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-emerald-600 hover:text-white transition-all" title="Editar Loja">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(loja.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Excluir">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
      </div>

      {/* Modal de Edição (CRUD) */}
      {editingLoja && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-2xl font-black mb-6">Editar Loja</h3>
            
            <div className="space-y-6">
               <div className="flex items-center gap-6 mb-4">
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  <div 
                    onClick={() => logoInputRef.current?.click()}
                    className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-500 overflow-hidden relative group"
                  >
                     {editingLoja.logo ? (
                        <img src={editingLoja.logo} className="w-full h-full object-cover" />
                     ) : (
                        <span className="text-2xl text-gray-300">📷</span>
                     )}
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-black uppercase">Alterar</span>
                     </div>
                  </div>
                  <div>
                     <p className="font-bold text-gray-800">Logotipo da Loja</p>
                     <p className="text-xs text-gray-400 cursor-pointer hover:text-emerald-600" onClick={() => logoInputRef.current?.click()}>Clique para alterar</p>
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome da Loja</label>
                  <input 
                    type="text" 
                    value={editingLoja.nome} 
                    onChange={e => setEditingLoja({...editingLoja, nome: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 mt-2 font-bold outline-none focus:border-emerald-500"
                  />
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Slug (URL)</label>
                  <input 
                    type="text" 
                    value={editingLoja.slug} 
                    onChange={e => setEditingLoja({...editingLoja, slug: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 mt-2 font-bold outline-none focus:border-emerald-500"
                  />
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Plano de Assinatura</label>
                  <div className="space-y-2 mt-2">
                    {planos.map(p => (
                        <button 
                        key={p.id} 
                        onClick={() => setEditingLoja({...editingLoja, planoId: p.id})}
                        className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${editingLoja.planoId === p.id ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-gray-100 bg-white text-gray-600'}`}
                        >
                        <span className="font-black">{p.nome}</span> - {formatCurrency(p.preco)}
                        </button>
                    ))}
                  </div>
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status da Assinatura</label>
                  <select 
                    value={editingLoja.statusAssinatura}
                    onChange={e => setEditingLoja({...editingLoja, statusAssinatura: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 mt-2 font-bold outline-none"
                  >
                     <option value="ativo">Ativo</option>
                     <option value="cancelado">Cancelado/Inativo</option>
                     <option value="teste">Período de Teste</option>
                  </select>
               </div>
            </div>

            <div className="flex gap-4 mt-8">
               <button onClick={() => setEditingLoja(null)} className="flex-1 py-4 font-black text-gray-400 uppercase text-xs hover:text-gray-600">Cancelar</button>
               <button onClick={handleSaveEdit} className="flex-[2] bg-emerald-600 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-lg">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
