
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { formatCurrency, convertFileToBase64, formatDate } from '../utils';
import { Link } from 'react-router-dom';

export const SuperAdminLojas = () => {
  const { lojas, planos, updateLoja, deleteLoja, addLoja, addNotification } = useStore();
  const [editingLoja, setEditingLoja] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  
  // Estado para criação de loja
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLoja, setNewLoja] = useState({ nome: '', email: '', planoId: '' });

  // Define um plano padrão ao abrir o modal
  useEffect(() => {
    if (planos.length > 0 && !newLoja.planoId) {
        setNewLoja(prev => ({ ...prev, planoId: planos[0].id }));
    }
  }, [planos, isCreateModalOpen]);
  
  // Estado para a concessão de acesso
  const [grantAmount, setGrantAmount] = useState(1);
  const [grantUnit, setGrantUnit] = useState<'days' | 'months' | 'years'>('months');

  const logoInputRef = useRef<HTMLInputElement>(null);

  const filteredLojas = useMemo(() => {
    return lojas
      .filter(loja => loja.id !== 'l1')
      .filter(loja => 
        loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loja.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
      // Ordena: Pendentes primeiro
      .sort((a, b) => (a.statusAssinatura === 'pendente' ? -1 : 1));
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

  const handleSaveEdit = () => {
      if (editingLoja) {
          updateLoja(editingLoja.id, editingLoja);
          addNotification('success', 'Loja atualizada com sucesso!');
          setEditingLoja(null);
      }
  };

  const handleCreateLoja = () => {
      // Validação reforçada com trim()
      if (!newLoja.nome.trim() || !newLoja.email.trim() || !newLoja.planoId) {
          addNotification('error', 'Preencha todos os campos obrigatórios.');
          return;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const slug = newLoja.nome.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

      addLoja({
          id: `loja-${id}`,
          nome: newLoja.nome.trim(),
          slug: slug,
          planoId: newLoja.planoId,
          email: newLoja.email.trim(),
          statusAssinatura: 'ativo',
          proximoVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
          whatsapp: '',
          taxaEntrega: 0,
          tempoMin: 30,
          tempoMax: 60,
          aceitaRetirada: true,
          stats: { carrinhos: 0, finalizados: 0, mrr: 0 }
      });

      addNotification('success', `Loja ${newLoja.nome} criada com sucesso!`);
      setIsCreateModalOpen(false);
      setNewLoja({ nome: '', email: '', planoId: planos[0]?.id || '' });
  };

  const handleGrantAccess = () => {
    if (!editingLoja) return;
    
    const currentDate = new Date(); // Começa a contar de hoje
    if (grantUnit === 'days') currentDate.setDate(currentDate.getDate() + grantAmount);
    if (grantUnit === 'months') currentDate.setMonth(currentDate.getMonth() + grantAmount);
    if (grantUnit === 'years') currentDate.setFullYear(currentDate.getFullYear() + grantAmount);

    setEditingLoja({
        ...editingLoja,
        proximoVencimento: currentDate.toISOString().split('T')[0],
        statusAssinatura: 'ativo'
    });
    addNotification('info', `Acesso liberado até ${currentDate.toLocaleDateString()}`);
  };

  // Aprovar: Ativa a loja e dá 30 dias (ou mês seguinte)
  const handleApproveLoja = (loja: any) => {
      const proximoMes = new Date();
      proximoMes.setMonth(proximoMes.getMonth() + 1);
      
      updateLoja(loja.id, {
          statusAssinatura: 'ativo',
          proximoVencimento: proximoMes.toISOString()
      });
      addNotification('success', `Loja ${loja.nome} aprovada e ativada!`);
  };

  // Recusar: Muda status para cancelado (bloqueia acesso, mantém registro)
  const handleRejectLoja = (loja: any) => {
      if(window.confirm(`Deseja recusar a solicitação da loja "${loja.nome}"? Ela ficará com status Cancelado.`)) {
          updateLoja(loja.id, { statusAssinatura: 'cancelado' });
          addNotification('info', `Solicitação de ${loja.nome} foi recusada.`);
      }
  };

  // Excluir: Remove permanentemente
  const handleDeleteLoja = (id: string, nome: string) => {
      if(window.confirm(`ATENÇÃO: Deseja excluir PERMANENTEMENTE a loja "${nome}"? Esta ação não pode ser desfeita.`)) {
          deleteLoja(id);
          addNotification('info', `Loja ${nome} excluída do sistema.`);
      }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-10 relative pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">Gestão de Unidades</h1>
          <p className="text-gray-400 font-bold mt-2">Monitore assinaturas e conceda acessos VIP.</p>
        </div>
      </div>

      {/* Barra de Busca */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
          <input 
            type="text" 
            placeholder="Buscar loja..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-700 outline-none"
          />
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                <tr>
                <th className="p-8">Loja / URL</th>
                <th className="p-8">Plano Atual</th>
                <th className="p-8">Vencimento</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-right">Ações</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
                {currentLojas.map(loja => {
                const plano = planos.find(p => p.id === loja.planoId);
                return (
                    <tr key={loja.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                                {loja.logo && <img src={loja.logo} className="w-full h-full object-cover" />}
                            </div>
                            <div>
                                <div className="font-black text-gray-800">{loja.nome}</div>
                                <div className="text-[10px] font-bold text-gray-400">pedemais.app/loja/{loja.slug}</div>
                            </div>
                        </div>
                    </td>
                    <td className="p-8">
                        <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${plano?.privado ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                            {plano?.privado && '🔒 '}{plano?.nome}
                        </span>
                    </td>
                    <td className="p-8">
                        <div className="text-xs font-bold text-gray-600">{formatDate(loja.proximoVencimento)}</div>
                    </td>
                    <td className="p-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            loja.statusAssinatura === 'ativo' ? 'bg-emerald-100 text-emerald-700' : 
                            loja.statusAssinatura === 'pendente' ? 'bg-yellow-100 text-yellow-700 animate-pulse' : 
                            'bg-red-100 text-red-700'
                        }`}>
                        {loja.statusAssinatura}
                        </span>
                    </td>
                    <td className="p-8 text-right flex justify-end gap-2 items-center">
                        {loja.statusAssinatura === 'pendente' ? (
                            <>
                                <button 
                                    onClick={() => handleApproveLoja(loja)} 
                                    className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200"
                                    title="Aprovar e Liberar Acesso"
                                >
                                    ✅
                                </button>
                                <button 
                                    onClick={() => handleRejectLoja(loja)} 
                                    className="bg-amber-500 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-amber-600 transition-all shadow-md shadow-amber-200"
                                    title="Recusar Solicitação"
                                >
                                    🚫
                                </button>
                                <button 
                                    onClick={() => handleDeleteLoja(loja.id, loja.nome)} 
                                    className="bg-red-500 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-600 transition-all shadow-md shadow-red-200"
                                    title="Excluir Permanentemente"
                                >
                                    🗑️
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setEditingLoja(loja)} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-200 transition-all">⚙️</button>
                        )}
                        
                        {/* Se não for pendente, permitir excluir pelo menu de edição ou adicionar botão extra aqui se desejar */}
                        {loja.statusAssinatura !== 'pendente' && (
                             <button onClick={() => handleDeleteLoja(loja.id, loja.nome)} className="p-3 bg-red-50 text-red-300 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all" title="Excluir Loja">🗑️</button>
                        )}
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>
      </div>

      {/* Botão Flutuante (FAB) para Adicionar Nova Loja */}
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center text-4xl font-black hover:bg-emerald-500 hover:scale-110 active:scale-95 transition-all z-50 group"
        title="Cadastrar Nova Loja"
      >
        <span className="mb-1">+</span>
        <span className="absolute right-20 bg-gray-900 text-white text-[10px] font-black uppercase py-2 px-4 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Nova Loja
        </span>
      </button>

      {/* Modal de Criação de Loja (Z-INDEX ALTO) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Nova Loja</h3>
                    <button onClick={() => setIsCreateModalOpen(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 hover:bg-gray-200">✕</button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nome do Estabelecimento</label>
                        <input 
                            type="text" 
                            value={newLoja.nome} 
                            onChange={e => setNewLoja({...newLoja, nome: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Ex: Pizzaria do João"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">E-mail do Responsável</label>
                        <input 
                            type="email" 
                            value={newLoja.email} 
                            onChange={e => setNewLoja({...newLoja, email: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="contato@loja.com"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Plano Inicial</label>
                        <select 
                            value={newLoja.planoId} 
                            onChange={e => setNewLoja({...newLoja, planoId: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                            {planos.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.nome} {p.privado ? '(Privado)' : ''} - {formatCurrency(p.preco)}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <button 
                        onClick={handleCreateLoja}
                        className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-500 transition-all mt-4"
                    >
                        Criar Loja
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Modal de Edição & Concessão de Acesso (Z-INDEX ALTO) */}
      {editingLoja && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-xl shadow-2xl animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Gerenciar Assinatura</h3>
                <button onClick={() => setEditingLoja(null)} className="text-gray-400 font-bold">✕</button>
            </div>
            
            <div className="space-y-10">
               {/* Seção 1: Seleção de Plano (Inclui Secretos) */}
               <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Escolher Plano (Super Admin)</label>
                  <div className="grid grid-cols-2 gap-4">
                    {planos.map(p => (
                        <button 
                            key={p.id} 
                            onClick={() => setEditingLoja({...editingLoja, planoId: p.id})}
                            className={`p-4 rounded-2xl border-2 text-left transition-all relative ${editingLoja.planoId === p.id ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100' : 'border-gray-100 hover:border-gray-200'}`}
                        >
                            {p.privado && <span className="absolute top-2 right-2 text-xs">🔒</span>}
                            <p className="font-black text-sm text-gray-800">{p.nome}</p>
                            <p className="text-[10px] font-bold text-gray-400">{formatCurrency(p.preco)}/mês</p>
                        </button>
                    ))}
                  </div>
               </div>

               {/* Seção 2: Concessão de Acesso Grátis (Módulo Secreto) */}
               <div className="bg-emerald-50 rounded-[2rem] p-8 border-2 border-emerald-100">
                  <h4 className="font-black text-emerald-800 text-sm mb-6 flex items-center gap-2">
                      🎁 Conceder Acesso / Ativar
                  </h4>
                  <p className="text-xs text-emerald-700 mb-4">Isto irá ativar a loja e definir o novo vencimento a partir de hoje.</p>
                  <div className="flex gap-4 flex-wrap">
                      <input 
                        type="number" value={grantAmount} onChange={e => setGrantAmount(Number(e.target.value))}
                        className="w-20 bg-white border border-emerald-200 rounded-xl p-4 font-black text-center" 
                      />
                      <select 
                        value={grantUnit} onChange={e => setGrantUnit(e.target.value as any)}
                        className="flex-1 bg-white border border-emerald-200 rounded-xl p-4 font-black text-sm outline-none"
                      >
                          <option value="days">Dia(s)</option>
                          <option value="months">Mês(es)</option>
                          <option value="years">Ano(s)</option>
                      </select>
                      <button 
                        onClick={handleGrantAccess}
                        className="bg-emerald-600 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase shadow-md hover:bg-emerald-500 transition-all w-full sm:w-auto"
                      >
                          Aplicar
                      </button>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => setEditingLoja(null)} className="flex-1 py-4 font-black text-gray-400 uppercase text-xs">Cancelar</button>
                  <button onClick={handleSaveEdit} className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl">Salvar Alterações</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
