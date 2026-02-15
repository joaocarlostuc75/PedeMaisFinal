
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { Entregador } from '../types';

export const LojistaEntregadores = () => {
  const { entregadores, addEntregador, updateEntregador, deleteEntregador, user, addNotification } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Estado inicial do formulário
  const initialForm = {
    nome: '',
    telefone: '',
    tipoVeiculo: 'Moto' as Entregador['tipoVeiculo'],
    placa: ''
  };
  const [form, setForm] = useState(initialForm);

  // Identifica a loja atual do usuário
  const currentLojaId = user?.lojaId || 'l1';

  // Opções de veículo
  const veiculos = ['Moto', 'Carro', 'Bicicleta', 'Van', 'Caminhão (Leve)', 'Caminhão (Pesado)'];

  const handleOpenModal = (entregador?: Entregador) => {
    if (entregador) {
        setEditingId(entregador.id);
        setForm({
            nome: entregador.nome,
            telefone: entregador.telefone,
            tipoVeiculo: entregador.tipoVeiculo,
            placa: entregador.placa || ''
        });
    } else {
        setEditingId(null);
        setForm(initialForm);
    }
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.nome || !form.telefone) {
        addNotification('error', 'Nome e telefone são obrigatórios.');
        return;
    }

    if (editingId) {
        // Atualizar existente
        updateEntregador(editingId, {
            nome: form.nome,
            telefone: form.telefone,
            tipoVeiculo: form.tipoVeiculo,
            placa: form.placa
        });
        addNotification('success', 'Entregador atualizado com sucesso!');
    } else {
        // Criar novo
        addEntregador({
            id: Math.random().toString(36).substr(2, 9),
            ...form,
            status: 'disponível',
            saldo: 0,
            entregasHoje: 0,
            lojaId: currentLojaId
        });
        addNotification('success', 'Entregador cadastrado com sucesso!');
    }
    
    setShowModal(false);
    setForm(initialForm);
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Tem certeza que deseja excluir este entregador? O histórico financeiro será mantido apenas nos relatórios gerais.')) {
          deleteEntregador(id);
          addNotification('info', 'Entregador removido.');
      }
  };

  const toggleDetails = (id: string) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Frota de Entrega</h1>
          <p className="text-gray-500 mt-2">Gestão direta dos seus parceiros logísticos.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:scale-105 transition-all"
        >
          ADICIONAR ENTREGADOR
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {entregadores.filter(e => e.lojaId === currentLojaId).map(e => {
          const isExpanded = expandedIds.has(e.id);
          
          return (
            <div key={e.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 group hover:border-emerald-500 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-[1.5rem] flex items-center justify-center font-black text-2xl text-gray-400 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  {e.nome.charAt(0)}
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${e.status === 'disponível' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {e.status}
                  </span>
                  <p className="text-[10px] font-black text-gray-400 mt-2 uppercase">Online agora</p>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-gray-800 mb-1">{e.nome}</h3>
              <p className="text-gray-400 font-bold mb-8">{e.telefone}</p>
              
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-gray-50">
                <div className="bg-gray-50/50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ganhos Hoje</p>
                  <p className="text-lg font-black text-gray-800">{formatCurrency(e.saldo)}</p>
                </div>
                <div className="bg-gray-50/50 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entregas</p>
                  <p className="text-lg font-black text-gray-800">{e.entregasHoje}</p>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-8 pt-8 border-t border-gray-50 animate-fade-in space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nível & XP</p>
                         <p className="text-sm font-black text-emerald-600">{e.nivel} <span className="text-gray-300">|</span> {e.xp} XP</p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Desde</p>
                         <p className="text-sm font-bold text-gray-600">{formatDate(e.dataAdesao)}</p>
                      </div>
                   </div>
                   
                   <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3 mb-3">
                         <span className="text-xl">🚚</span>
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Veículo</p>
                            <p className="font-bold text-gray-800 text-sm">{e.tipoVeiculo}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xl">🔢</span>
                         <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Placa</p>
                            <p className="font-bold text-gray-800 text-sm tracking-widest">{e.placa || '---'}</p>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              <div className="mt-8 flex gap-3">
                 <button 
                    onClick={() => toggleDetails(e.id)}
                    className={`flex-1 border-2 py-3 rounded-xl text-xs font-black transition-all uppercase ${isExpanded ? 'bg-gray-900 border-gray-900 text-white' : 'bg-white border-gray-100 text-gray-600 hover:border-emerald-500'}`}
                 >
                    {isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}
                 </button>
                 <button onClick={() => handleOpenModal(e)} className="p-3 bg-gray-100 text-gray-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all" title="Editar entregador">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                 </button>
                 <button onClick={() => handleDelete(e.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Excluir entregador">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                 </button>
              </div>
            </div>
          );
        })}
        
        {entregadores.filter(e => e.lojaId === currentLojaId).length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <span className="text-4xl block mb-4">🛵</span>
                <h3 className="text-xl font-bold text-gray-800">Sua frota está vazia</h3>
                <p className="text-gray-400 text-sm mt-2 mb-6">Adicione entregadores para começar a gerenciar suas entregas.</p>
                <button onClick={() => handleOpenModal()} className="text-emerald-600 font-black uppercase text-xs hover:underline">Cadastrar primeiro entregador</button>
            </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-bounce-in max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-3xl font-black text-gray-900 mb-2">{editingId ? 'Editar Membro' : 'Novo Membro'}</h2>
            <p className="text-gray-400 font-medium mb-10">{editingId ? 'Atualize os dados do entregador.' : 'Cadastre um novo entregador na sua frota.'}</p>
            
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nome Completo</label>
                <input 
                  type="text" 
                  value={form.nome}
                  onChange={(e) => setForm({...form, nome: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">WhatsApp</label>
                    <input 
                      type="text" 
                      value={form.telefone}
                      onChange={(e) => setForm({...form, telefone: e.target.value})}
                      placeholder="(99) 99999-9999"
                      className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Tipo de Veículo</label>
                    <select 
                        value={form.tipoVeiculo}
                        onChange={(e) => setForm({...form, tipoVeiculo: e.target.value as any})}
                        className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none appearance-none"
                    >
                        {veiculos.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Placa do Veículo</label>
                <input 
                  type="text" 
                  value={form.placa}
                  onChange={(e) => setForm({...form, placa: e.target.value.toUpperCase()})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all outline-none uppercase" 
                  placeholder="ABC-1234"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 font-black text-gray-400 text-sm py-4 hover:bg-gray-50 rounded-2xl transition-all">CANCELAR</button>
              <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-all">
                  {editingId ? 'SALVAR ALTERAÇÕES' : 'CADASTRAR'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
