
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Plano } from '../types';

export const SuperAdminPlanos = () => {
  const { planos, addPlano, updatePlano, deletePlano, addNotification } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlano, setEditingPlano] = useState<Partial<Plano> | null>(null);
  
  // Estado local para adicionar novo recurso dentro do modal
  const [newRecursoInput, setNewRecursoInput] = useState('');

  const initialPlano: Partial<Plano> = {
    nome: '',
    preco: 0,
    limitePedidos: 100,
    limiteEntregadores: 5,
    recursos: [],
    cor: 'bg-gray-100',
    destaque: false,
    privado: false
  };

  const handleOpenModal = (plano?: Plano) => {
    setEditingPlano(plano ? { ...plano } : initialPlano);
    setNewRecursoInput('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlano(null);
  };

  const handleSave = () => {
    if (!editingPlano?.nome || editingPlano.preco === undefined) {
      addNotification('error', 'Preencha os campos obrigatórios.');
      return;
    }

    if (editingPlano.id) {
      updatePlano(editingPlano.id, editingPlano);
      addNotification('success', 'Plano atualizado com sucesso!');
    } else {
      addPlano({
        ...editingPlano,
        id: Math.random().toString(36).substr(2, 9),
        recursos: editingPlano.recursos || [],
      } as Plano);
      addNotification('success', 'Novo plano criado!');
    }
    handleCloseModal();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir este plano? Lojas assinantes podem ser afetadas.')) {
      deletePlano(id);
      addNotification('info', 'Plano removido.');
    }
  };

  const handleEditClick = (e: React.MouseEvent, p: Plano) => {
      e.stopPropagation();
      handleOpenModal(p);
  };

  const handleAddRecurso = () => {
      if (!newRecursoInput.trim()) return;
      if (editingPlano) {
          setEditingPlano({
              ...editingPlano,
              recursos: [...(editingPlano.recursos || []), newRecursoInput.trim()]
          });
          setNewRecursoInput('');
      }
  };

  const handleRemoveRecurso = (index: number) => {
      if (editingPlano && editingPlano.recursos) {
          const updated = [...editingPlano.recursos];
          updated.splice(index, 1);
          setEditingPlano({ ...editingPlano, recursos: updated });
      }
  };

  const colors = [
    { label: 'Cinza', value: 'bg-gray-100' },
    { label: 'Esmeralda', value: 'bg-emerald-600' },
    { label: 'Roxo', value: 'bg-purple-600' },
    { label: 'Azul', value: 'bg-blue-600' },
    { label: 'Preto', value: 'bg-gray-900' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Planos & Preços</h1>
            <p className="text-gray-500 font-bold mt-1">Defina a estratégia de monetização e planos secretos VIP.</p>
        </div>
        <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
            <span>+</span> NOVO PLANO
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {planos.map(p => (
          <div key={p.id} className={`bg-white p-10 rounded-[3rem] shadow-sm border-2 flex flex-col justify-between transition-all hover:shadow-xl relative overflow-hidden group ${p.destaque ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-gray-100'}`}>
            {p.privado && (
                <div className="absolute top-4 right-4 bg-gray-900 text-white p-2 rounded-full shadow-lg" title="Plano Secreto (Privado)">
                    🔒
                </div>
            )}
            {p.destaque && !p.privado && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-b-xl text-[10px] font-black uppercase tracking-widest">
                    Destaque
                </div>
            )}
            
            <div>
              <div className="flex justify-between items-start">
                  <h3 className="text-3xl font-black mb-2 text-gray-800 flex items-center gap-2">
                      {p.nome}
                  </h3>
                  <div className={`w-6 h-6 rounded-full ${p.cor} shadow-sm`} />
              </div>
              <p className="text-5xl font-black text-emerald-600 mb-8 tracking-tighter">
                {formatCurrency(p.preco)}<span className="text-sm font-bold text-gray-400 ml-1 tracking-normal">/mês</span>
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-gray-600 font-bold text-sm">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center text-xs">📦</span> 
                  {p.limitePedidos >= 99999 ? 'Pedidos ilimitados' : `Até ${p.limitePedidos} pedidos`}
                </li>
                <li className="flex items-center gap-3 text-gray-600 font-bold text-sm">
                  <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center text-xs">🛵</span> 
                  {p.limiteEntregadores >= 999 ? 'Entregadores ilimitados' : `Até ${p.limiteEntregadores} entregadores`}
                </li>
                {p.recursos.map((rec, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-600 font-bold text-sm">
                        <span className="w-5 h-5 bg-emerald-100 text-emerald-600 rounded-md flex items-center justify-center text-xs">✓</span>
                        {rec}
                    </li>
                ))}
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <button onClick={(e) => handleEditClick(e, p)} className="bg-gray-100 text-gray-600 py-3 rounded-xl font-black text-xs uppercase hover:bg-gray-200 transition-colors">Editar</button>
                <button onClick={(e) => handleDelete(e, p.id)} className="bg-red-50 text-red-500 py-3 rounded-xl font-black text-xs uppercase hover:bg-red-500 hover:text-white transition-colors">Excluir</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && editingPlano && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[9999] p-0 md:p-4">
            <div className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in">
                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-2xl font-black text-gray-900">{editingPlano.id ? 'Editar Plano' : 'Novo Plano'}</h2>
                </div>
                <div className="p-8 space-y-6 pb-8 md:pb-0">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Nome do Plano</label>
                        <input 
                            type="text" 
                            value={editingPlano.nome} 
                            onChange={e => setEditingPlano({...editingPlano, nome: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Ex: Start"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Preço (R$)</label>
                            <input 
                                type="number" 
                                value={editingPlano.preco} 
                                onChange={e => setEditingPlano({...editingPlano, preco: Number(e.target.value)})}
                                className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Cor do Card</label>
                            <select 
                                value={editingPlano.cor} 
                                onChange={e => setEditingPlano({...editingPlano, cor: e.target.value})}
                                className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            >
                                {colors.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Limite Pedidos</label>
                            <input 
                                type="number"
                                value={editingPlano.limitePedidos} 
                                onChange={e => setEditingPlano({...editingPlano, limitePedidos: Number(e.target.value)})}
                                className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Limite Entregadores</label>
                            <input 
                                type="number"
                                value={editingPlano.limiteEntregadores} 
                                onChange={e => setEditingPlano({...editingPlano, limiteEntregadores: Number(e.target.value)})}
                                className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Gestão de Benefícios */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Benefícios & Recursos</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text"
                                value={newRecursoInput}
                                onChange={e => setNewRecursoInput(e.target.value)}
                                placeholder="Ex: Suporte 24h"
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                                onKeyDown={e => e.key === 'Enter' && handleAddRecurso()}
                            />
                            <button onClick={handleAddRecurso} className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-black text-xs uppercase hover:bg-emerald-500">Add</button>
                        </div>
                        <ul className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                            {editingPlano.recursos && editingPlano.recursos.map((rec, idx) => (
                                <li key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-700">
                                    <span>{rec}</span>
                                    <button onClick={() => handleRemoveRecurso(idx)} className="text-red-400 hover:text-red-600 font-black px-2">✕</button>
                                </li>
                            ))}
                            {(!editingPlano.recursos || editingPlano.recursos.length === 0) && (
                                <p className="text-[10px] text-gray-400 text-center italic">Nenhum benefício adicionado.</p>
                            )}
                        </ul>
                    </div>

                    <div 
                      className="flex items-center justify-between bg-gray-900 text-white p-4 rounded-xl cursor-pointer" 
                      onClick={() => setEditingPlano({...editingPlano, privado: !editingPlano.privado})}
                    >
                        <div>
                            <p className="font-black text-sm uppercase">Plano Privado (Secreto)?</p>
                            <p className="text-[10px] text-gray-400">Não aparecerá na Landing Page.</p>
                        </div>
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${editingPlano.privado ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-all ${editingPlano.privado ? 'left-5' : 'left-1'}`} />
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl cursor-pointer" onClick={() => setEditingPlano({...editingPlano, destaque: !editingPlano.destaque})}>
                        <div className={`w-10 h-6 rounded-full relative transition-colors ${editingPlano.destaque ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-all ${editingPlano.destaque ? 'left-5' : 'left-1'}`} />
                        </div>
                        <span className="font-bold text-sm text-gray-700">Plano Destaque?</span>
                    </div>
                </div>
                <div className="p-8 border-t border-gray-100 flex gap-4">
                    <button onClick={handleCloseModal} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-xs">Cancelar</button>
                    <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white rounded-xl font-black uppercase text-xs shadow-lg hover:bg-emerald-500">Salvar Plano</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
