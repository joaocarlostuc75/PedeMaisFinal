
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

export const LojistaEntregadores = () => {
  const { entregadores, addEntregador } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [novo, setNovo] = useState({ nome: '', telefone: '' });

  const handleSave = () => {
    if (!novo.nome || !novo.telefone) return;
    addEntregador({
      id: Math.random().toString(36).substr(2, 9),
      ...novo,
      status: 'disponível',
      saldo: 0,
      entregasHoje: 0,
      lojaId: 'l1'
    });
    setShowModal(false);
    setNovo({ nome: '', telefone: '' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900">Frota de Entrega</h1>
          <p className="text-gray-500 mt-2">Gestão direta dos seus parceiros logísticos.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:scale-105 transition-all"
        >
          ADICIONAR ENTREGADOR
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
        {entregadores.filter(e => e.lojaId === 'l1').map(e => (
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

            <div className="mt-8 flex gap-3">
               <button className="flex-1 bg-white border-2 border-gray-100 py-3 rounded-xl text-xs font-black text-gray-600 hover:border-emerald-500 transition-all">HISTÓRICO</button>
               <button className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all" title="Excluir entregador">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
               </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl animate-bounce-in">
            <h2 className="text-3xl font-black text-gray-900 mb-2">Novo Membro</h2>
            <p className="text-gray-400 font-medium mb-10">Cadastre um novo entregador na sua frota.</p>
            
            <div className="space-y-6 mb-10">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Nome Completo</label>
                <input 
                  type="text" 
                  value={novo.nome}
                  onChange={(e) => setNovo({...novo, nome: e.target.value})}
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all" 
                  placeholder="Ex: João Silva"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">WhatsApp</label>
                <input 
                  type="text" 
                  value={novo.telefone}
                  onChange={(e) => setNovo({...novo, telefone: e.target.value})}
                  placeholder="11 99999-9999"
                  className="w-full bg-gray-50 border-none rounded-2xl p-5 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500 transition-all" 
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setShowModal(false)} className="flex-1 font-black text-gray-400 text-sm py-4">CANCELAR</button>
              <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-100">CADASTRAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
