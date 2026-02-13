
import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Entrega } from '../types';

export const LojistaPedidos = () => {
  const { entregas, atualizarStatusPedido } = useStore();
  const activeOrders = entregas.filter(e => e.lojaId === 'l1' && e.status !== 'finalizada' && e.status !== 'cancelada');

  const columns: { id: string; label: string; status: Entrega['status']; color: string; icon: string }[] = [
    { id: 'new', label: 'Pendentes', status: 'pendente', color: 'bg-blue-50 border-blue-200', icon: '🔔' },
    { id: 'prep', label: 'Na Cozinha', status: 'preparando', color: 'bg-orange-50 border-orange-200', icon: '👨‍🍳' },
    { id: 'ready', label: 'Pronto p/ Entrega', status: 'pronto', color: 'bg-emerald-50 border-emerald-200', icon: '🛵' },
    { id: 'transit', label: 'Em Trânsito', status: 'em_transito', color: 'bg-gray-50 border-gray-200', icon: '💨' },
  ];

  const getNextAction = (status: Entrega['status'], id: string) => {
    switch (status) {
      case 'pendente':
        return (
          <div className="flex gap-2 mt-4">
             <button onClick={() => atualizarStatusPedido(id, 'cancelada')} className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-black text-xs uppercase hover:bg-red-50 transition-colors">Rejeitar</button>
             <button onClick={() => atualizarStatusPedido(id, 'preparando')} className="flex-[2] py-3 rounded-xl bg-blue-600 text-white font-black text-xs uppercase shadow-lg shadow-blue-200 hover:bg-blue-500 transition-colors">Aceitar</button>
          </div>
        );
      case 'preparando':
        return (
          <button onClick={() => atualizarStatusPedido(id, 'pronto')} className="w-full mt-4 py-3 rounded-xl bg-orange-500 text-white font-black text-xs uppercase shadow-lg shadow-orange-200 hover:bg-orange-400 transition-colors">
            Marcar como Pronto
          </button>
        );
      case 'pronto':
        return (
          <div className="mt-4 bg-white/50 p-3 rounded-xl border border-dashed border-gray-300 text-center">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Aguardando Entregador...</p>
          </div>
        );
      case 'em_transito':
        return (
           <div className="mt-4 flex items-center gap-2 justify-center text-emerald-600 font-bold text-xs">
              <span className="animate-pulse">●</span> Saiu para entrega
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col font-sans">
      <header className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Gestão de Pedidos</h1>
          <p className="text-gray-500 font-medium mt-1">Acompanhe o fluxo da cozinha em tempo real.</p>
        </div>
        <div className="flex gap-3">
           <div className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black text-sm flex items-center gap-2 border border-red-100">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
             {activeOrders.filter(o => o.status === 'pendente').length} Pendentes
           </div>
           <button className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-sm shadow-xl">
             Pausar Loja
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-6 h-full min-w-[1200px]">
          {columns.map(col => (
            <div key={col.id} className={`flex-1 flex flex-col rounded-[2.5rem] border ${col.color} p-2 bg-opacity-50`}>
              <div className="p-6 flex justify-between items-center shrink-0">
                 <h3 className="font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-2xl">{col.icon}</span> {col.label}
                 </h3>
                 <span className="bg-white/80 px-3 py-1 rounded-lg text-xs font-black text-gray-500 shadow-sm">
                   {activeOrders.filter(o => o.status === col.status).length}
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 custom-scrollbar">
                 {activeOrders.filter(o => o.status === col.status).map(order => (
                   <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{order.id.slice(-4)}</span>
                            <h4 className="font-black text-gray-800 text-lg leading-tight">{order.clienteNome}</h4>
                         </div>
                         <div className="text-right">
                            <span className="block font-black text-emerald-600">{formatCurrency(order.valor)}</span>
                            <span className="text-[10px] text-gray-400 font-bold">{new Date(order.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                      </div>

                      <div className="space-y-2 mb-4">
                         {order.itens?.map((item, idx) => (
                           <div key={idx} className="flex gap-2 text-sm text-gray-600 font-medium">
                              <span className="font-black text-gray-800">{item.qtd}x</span>
                              <span>{item.nome}</span>
                           </div>
                         ))}
                      </div>
                      
                      {order.endereco && (
                         <div className="bg-gray-50 p-3 rounded-xl mb-2 flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">📍</span>
                            <p className="text-[10px] font-bold text-gray-500 leading-tight">{order.endereco}</p>
                         </div>
                      )}

                      {getNextAction(order.status, order.id)}
                   </div>
                 ))}
                 {activeOrders.filter(o => o.status === col.status).length === 0 && (
                    <div className="h-40 flex items-center justify-center text-gray-300 font-bold uppercase text-xs tracking-widest text-center opacity-50 border-2 border-dashed border-gray-200 rounded-[2rem]">
                       Vazio
                    </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
