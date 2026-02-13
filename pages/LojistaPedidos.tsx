
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Entrega } from '../types';

export const LojistaPedidos = () => {
  const { entregas, entregadores, atualizarStatusPedido, atribuirEntregador, addNotification, user } = useStore();
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(new Date());
  
  // Identifica a loja atual do usuário
  const currentLojaId = user?.lojaId || 'l1';
  
  // Estado para controlar o modal de seleção de entregador
  const [selectingCourierForOrder, setSelectingCourierForOrder] = useState<string | null>(null);

  // Estado do Filtro: 'ativos' é o padrão (Kanban), outros são específicos
  const [statusFilter, setStatusFilter] = useState<string>('ativos');

  // Atualiza o relógio a cada minuto para verificar atrasos em tempo real
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  // Filtra entregadores da loja atual
  const meusEntregadores = entregadores.filter(e => e.lojaId === currentLojaId && e.status !== 'suspenso');

  const toggleDetails = (id: string) => {
    const newSet = new Set(expandedOrders);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedOrders(newSet);
  };

  const handleDispatch = (entregadorId: string) => {
    if (selectingCourierForOrder) {
      atribuirEntregador(selectingCourierForOrder, entregadorId);
      addNotification('success', 'Entregador atribuído com sucesso!');
      setSelectingCourierForOrder(null);
    }
  };

  // Configuração de todas as colunas possíveis
  const ALL_COLUMNS: { id: string; label: string; status: Entrega['status']; color: string; icon: string }[] = [
    { id: 'pendente', label: 'Pendentes', status: 'pendente', color: 'bg-blue-50 border-blue-200', icon: '🔔' },
    { id: 'preparando', label: 'Na Cozinha', status: 'preparando', color: 'bg-orange-50 border-orange-200', icon: '👨‍🍳' },
    { id: 'pronto', label: 'Pronto p/ Entrega', status: 'pronto', color: 'bg-emerald-50 border-emerald-200', icon: '📍' },
    { id: 'em_transito', label: 'Em Trânsito', status: 'em_transito', color: 'bg-purple-50 border-purple-200', icon: '💨' },
    { id: 'finalizada', label: 'Finalizados', status: 'finalizada', color: 'bg-gray-100 border-gray-200', icon: '✨' },
    { id: 'cancelada', label: 'Cancelados', status: 'cancelada', color: 'bg-red-50 border-red-200', icon: '🚫' },
  ];

  // Filtra quais colunas exibir baseado no statusFilter
  const visibleColumns = useMemo(() => {
    if (statusFilter === 'ativos') {
      return ALL_COLUMNS.filter(c => ['pendente', 'preparando', 'pronto', 'em_transito'].includes(c.status));
    }
    return ALL_COLUMNS.filter(c => c.status === statusFilter);
  }, [statusFilter]);

  // Filtra os pedidos da loja atual
  const filteredOrders = useMemo(() => {
    return entregas.filter(e => {
      const isMinhaLoja = e.lojaId === currentLojaId;
      if (!isMinhaLoja) return false;

      if (statusFilter === 'ativos') {
        return ['pendente', 'preparando', 'pronto', 'em_transito'].includes(e.status);
      }
      return e.status === statusFilter;
    });
  }, [entregas, statusFilter, currentLojaId]);

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
          <button 
            onClick={() => setSelectingCourierForOrder(id)}
            className="w-full mt-4 py-3 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2"
          >
            <span>🛵</span> Chamar Entregador
          </button>
        );
      case 'em_transito':
        const entrega = entregas.find(e => e.id === id);
        const entregador = entregadores.find(e => e.id === entrega?.entregadorId);
        return (
           <div className="mt-4 bg-purple-50 p-3 rounded-xl border border-purple-100">
              <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Entregador Responsável</p>
              <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center text-[10px] font-black text-purple-800">
                    {entregador?.nome.charAt(0) || '?'}
                 </div>
                 <span className="text-xs font-black text-purple-900">{entregador?.nome || 'Desconhecido'}</span>
              </div>
           </div>
        );
      case 'finalizada':
        return (
            <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase">Concluído em {new Date().toLocaleTimeString()}</p>
            </div>
        );
      case 'cancelada':
        return (
            <div className="mt-4 bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                <p className="text-[10px] font-black text-red-400 uppercase">Pedido Cancelado</p>
            </div>
        );
      default:
        return null;
    }
  };

  const filterOptions = [
    { id: 'ativos', label: 'Fluxo Ativo' },
    { id: 'pendente', label: 'Pendentes' },
    { id: 'preparando', label: 'Cozinha' },
    { id: 'pronto', label: 'Prontos' },
    { id: 'em_transito', label: 'Entregas' },
    { id: 'finalizada', label: 'Histórico' },
    { id: 'cancelada', label: 'Cancelados' },
  ];

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100dvh-80px)] lg:h-[calc(100vh-100px)] flex flex-col font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Gestão de Pedidos</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">Acompanhe o fluxo da cozinha em tempo real.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="px-4 md:px-6 py-3 bg-red-50 text-red-600 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 border border-red-100 flex-1 md:flex-none justify-center">
             <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
             {entregas.filter(o => o.status === 'pendente' && o.lojaId === currentLojaId).length} Pendentes
           </div>
           <button className="bg-gray-900 text-white px-4 md:px-6 py-3 rounded-xl font-black text-xs md:text-sm shadow-xl flex-1 md:flex-none">
             Pausar Loja
           </button>
        </div>
      </header>

      {/* Barra de Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 shrink-0 no-scrollbar pr-4">
        {filterOptions.map(opt => (
            <button
                key={opt.id}
                onClick={() => setStatusFilter(opt.id)}
                className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all border ${
                    statusFilter === opt.id 
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105' 
                    : 'bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
                }`}
            >
                {opt.label}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <div className="flex gap-4 md:gap-6 h-full min-w-full">
          {visibleColumns.map(col => (
            <div key={col.id} className={`flex-1 min-w-[300px] md:min-w-[320px] flex flex-col rounded-[2rem] md:rounded-[2.5rem] border ${col.color} p-2 bg-opacity-50 h-full`}>
              <div className="p-4 md:p-6 flex justify-between items-center shrink-0">
                 <h3 className="font-black text-gray-800 uppercase tracking-widest flex items-center gap-2 text-sm md:text-base">
                    <span className="text-xl md:text-2xl">{col.icon}</span> {col.label}
                 </h3>
                 <span className="bg-white/80 px-3 py-1 rounded-lg text-xs font-black text-gray-500 shadow-sm">
                   {filteredOrders.filter(o => o.status === col.status).length}
                 </span>
              </div>
              
              <div className="flex-1 overflow-y-auto px-2 md:px-4 pb-4 space-y-3 md:space-y-4 custom-scrollbar">
                 {filteredOrders.filter(o => o.status === col.status).map(order => {
                   const isExpanded = expandedOrders.has(order.id);
                   
                   // Lógica de atraso (15 minutos)
                   const diffMs = now.getTime() - new Date(order.data).getTime();
                   const diffMins = Math.floor(diffMs / 60000);
                   const isLate = order.status === 'pendente' && diffMins > 15;
                   
                   return (
                   <div key={order.id} className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border transition-all relative group ${
                     isLate && order.status === 'pendente'
                       ? 'bg-red-50 border-red-300 shadow-red-100' 
                       : 'bg-white border-gray-100 hover:shadow-md'
                   }`}>
                      {/* Alerta de Atraso */}
                      {isLate && order.status === 'pendente' && (
                        <div className="absolute -top-3 -right-2 bg-red-500 text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-1 z-20 animate-bounce">
                           <span>⏳</span> Atrasado (+{diffMins}m)
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{order.id.slice(-4)}</span>
                            <h4 className="font-black text-gray-800 text-base md:text-lg leading-tight">{order.clienteNome}</h4>
                         </div>
                         <div className="text-right">
                            <span className="block font-black text-emerald-600 text-sm md:text-base">{formatCurrency(order.valor)}</span>
                            <span className={`text-[10px] font-bold ${isLate && order.status === 'pendente' ? 'text-red-500' : 'text-gray-400'}`}>
                              {new Date(order.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                         </div>
                      </div>

                      {/* Seção de Itens Expansível */}
                      <div className="mb-4">
                         <button 
                             onClick={() => toggleDetails(order.id)}
                             className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors w-full mb-3"
                         >
                             <span>
                               {isExpanded ? 'Ocultar Itens' : `Ver ${order.itens.length} itens do pedido`}
                             </span>
                             <svg 
                                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                                fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                             >
                                <path d="M19 9l-7 7-7-7"/>
                             </svg>
                         </button>

                         {isExpanded ? (
                             <div className={`rounded-xl p-3 md:p-4 border space-y-3 animate-fade-in ${isLate && order.status === 'pendente' ? 'bg-white border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                                 {order.itens?.map((item, idx) => (
                                     <div key={idx} className="flex justify-between items-start border-b border-gray-200/60 last:border-0 pb-3 last:pb-0">
                                         <div className="flex gap-2 md:gap-3">
                                             <div className="bg-white w-6 h-6 flex items-center justify-center rounded-lg border border-gray-200 font-black text-gray-800 text-xs shadow-sm shrink-0">
                                                {item.qtd}
                                             </div>
                                             <div>
                                                 <p className="font-bold text-gray-800 text-xs md:text-sm leading-tight">{item.nome}</p>
                                                 {item.detalhe && (
                                                     <p className="text-[10px] text-gray-500 font-medium mt-1 leading-tight italic bg-yellow-50 px-1.5 py-0.5 rounded-md inline-block border border-yellow-100">
                                                       📝 {item.detalhe}
                                                     </p>
                                                 )}
                                             </div>
                                         </div>
                                         {item.preco && (
                                             <div className="text-right">
                                               <span className="block text-xs font-black text-emerald-600 whitespace-nowrap">
                                                   {formatCurrency(item.preco * item.qtd)}
                                               </span>
                                             </div>
                                         )}
                                     </div>
                                 ))}
                                 <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Total Itens</span>
                                    <span className="text-xs font-black text-gray-900">{formatCurrency(order.valor)}</span>
                                 </div>
                             </div>
                         ) : (
                             <div className="space-y-1 pl-1">
                                 {order.itens?.slice(0, 3).map((item, idx) => (
                                     <div key={idx} className="flex gap-2 text-xs md:text-sm text-gray-600 font-medium items-center">
                                         <span className="font-black text-gray-800 w-5 text-right">{item.qtd}x</span>
                                         <span className="truncate max-w-[150px]">{item.nome}</span>
                                     </div>
                                 ))}
                                 {order.itens.length > 3 && (
                                     <p className="text-[10px] text-gray-400 font-bold italic pl-7">+ {order.itens.length - 3} outros itens...</p>
                                 )}
                             </div>
                         )}
                      </div>
                      
                      {order.endereco && (
                         <div className={`p-3 rounded-xl mb-2 flex items-start gap-2 ${isLate && order.status === 'pendente' ? 'bg-white' : 'bg-gray-50'}`}>
                            <span className="text-gray-400 mt-0.5">📍</span>
                            <p className="text-[10px] font-bold text-gray-500 leading-tight line-clamp-2">{order.endereco}</p>
                         </div>
                      )}

                      {getNextAction(order.status, order.id)}
                   </div>
                   );
                 })}
                 {filteredOrders.filter(o => o.status === col.status).length === 0 && (
                    <div className="h-40 flex items-center justify-center text-gray-300 font-bold uppercase text-xs tracking-widest text-center opacity-50 border-2 border-dashed border-gray-200 rounded-[2rem]">
                       Vazio
                    </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Seleção Entregador */}
      {selectingCourierForOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-bounce-in flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-gray-100 bg-gray-50 shrink-0">
                 <h3 className="text-xl md:text-2xl font-black text-gray-900">Selecione o Entregador</h3>
                 <p className="text-gray-400 font-medium text-sm">Quem levará o pedido #{selectingCourierForOrder.slice(-4)}?</p>
              </div>
              <div className="p-6 overflow-y-auto">
                 {meusEntregadores.length === 0 ? (
                    <div className="text-center py-10">
                       <p className="text-gray-400 font-bold mb-4">Nenhum entregador cadastrado ou disponível.</p>
                       <button onClick={() => window.location.href = '#/admin/entregadores'} className="text-emerald-600 font-black text-xs uppercase hover:underline">Cadastrar Entregador</button>
                    </div>
                 ) : (
                    <div className="space-y-3">
                       {meusEntregadores.map(e => (
                          <button 
                             key={e.id}
                             onClick={() => handleDispatch(e.id)}
                             className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
                          >
                             <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-lg font-black text-gray-300 group-hover:text-emerald-600">
                                   {e.nome.charAt(0)}
                                </div>
                                <div>
                                   <p className="font-black text-gray-800 group-hover:text-emerald-900 text-sm">{e.nome}</p>
                                   <div className="flex gap-2 text-[10px] font-bold uppercase">
                                      <span className={e.status === 'disponível' ? 'text-emerald-500' : 'text-amber-500'}>{e.status}</span>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-gray-400">{e.tipoVeiculo}</span>
                                   </div>
                                </div>
                             </div>
                             {e.status === 'disponível' && (
                                <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-emerald-200">
                                   Chamar
                                </span>
                             )}
                          </button>
                       ))}
                    </div>
                 )}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
                 <button onClick={() => setSelectingCourierForOrder(null)} className="text-gray-400 font-black text-xs uppercase tracking-widest hover:text-gray-600 px-4">Cancelar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
