
import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Entrega } from '../types';

export const LojistaPedidos = () => {
  const { entregas, entregadores, atualizarStatusPedido, atribuirEntregador, addNotification, user } = useStore();
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

  const handleDispatch = (entregadorId: string) => {
    if (selectingCourierForOrder) {
      atribuirEntregador(selectingCourierForOrder, entregadorId);
      addNotification('success', 'Entregador atribuído com sucesso!');
      setSelectingCourierForOrder(null);
    }
  };

  // Helper para calcular tempo decorrido
  const getElapsedTime = (dateString: string) => {
    const diffMs = now.getTime() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m`;
  };

  // Helper para verificar status de atraso crítico (> 20 min em pendente ou cozinha)
  const isCritical = (dateString: string, status: string) => {
      const diffMs = now.getTime() - new Date(dateString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      return (status === 'pendente' || status === 'preparando') && diffMins > 20;
  };

  // Configuração das Colunas
  const ALL_COLUMNS: { id: string; label: string; status: Entrega['status']; bg: string; border: string; icon: string; headerColor: string }[] = [
    { id: 'pendente', label: 'Pendentes', status: 'pendente', bg: 'bg-white', border: 'border-l-4 border-l-blue-500', icon: '🔔', headerColor: 'text-blue-600' },
    { id: 'preparando', label: 'Na Cozinha', status: 'preparando', bg: 'bg-white', border: 'border-l-4 border-l-orange-500', icon: '🔥', headerColor: 'text-orange-600' },
    { id: 'pronto', label: 'Pronto p/ Entrega', status: 'pronto', bg: 'bg-white', border: 'border-l-4 border-l-emerald-500', icon: '📦', headerColor: 'text-emerald-600' },
    { id: 'em_transito', label: 'Em Trânsito', status: 'em_transito', bg: 'bg-white', border: 'border-l-4 border-l-purple-500', icon: '🛵', headerColor: 'text-purple-600' },
    { id: 'finalizada', label: 'Concluídos', status: 'finalizada', bg: 'bg-gray-50', border: 'border-l-4 border-l-gray-300', icon: '✅', headerColor: 'text-gray-500' },
    { id: 'cancelada', label: 'Cancelados', status: 'cancelada', bg: 'bg-red-50', border: 'border-l-4 border-l-red-300', icon: '🚫', headerColor: 'text-red-500' },
  ];

  // Filtra quais colunas exibir
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

  const filterOptions = [
    { id: 'ativos', label: 'Fluxo Ativo' },
    { id: 'pendente', label: 'Pendentes' },
    { id: 'preparando', label: 'Cozinha' },
    { id: 'pronto', label: 'Prontos' },
    { id: 'em_transito', label: 'Entregas' },
    { id: 'finalizada', label: 'Histórico' },
  ];

  return (
    <div className="max-w-[1800px] mx-auto h-[calc(100dvh-80px)] lg:h-[calc(100vh-100px)] flex flex-col font-sans bg-[#f8fafc]">
      {/* Header Fixo */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Gestão de Pedidos
            <span className="text-[10px] font-medium text-white bg-gray-900 px-2 py-1 rounded-md uppercase tracking-widest">{filteredOrders.length} ATIVOS</span>
          </h1>
        </div>
        
        {/* Barra de Filtros */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            {filterOptions.map(opt => (
                <button
                    key={opt.id}
                    onClick={() => setStatusFilter(opt.id)}
                    className={`px-4 py-2 rounded-lg font-bold text-[11px] uppercase tracking-wider whitespace-nowrap transition-all border ${
                        statusFilter === opt.id 
                        ? 'bg-gray-900 text-white border-gray-900 shadow-md' 
                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }`}
                >
                    {opt.label}
                </button>
            ))}
            <button className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg font-black text-[11px] uppercase tracking-wider hover:bg-red-100 transition-colors whitespace-nowrap">
                Pausar Loja
            </button>
        </div>
      </header>

      {/* Área do Kanban com Scroll Horizontal */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <div className="flex gap-6 h-full min-w-max">
          {visibleColumns.map(col => {
            const ordersInColumn = filteredOrders.filter(o => o.status === col.status).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
            
            return (
                <div key={col.id} className="flex flex-col w-[320px] md:w-[360px] h-full bg-gray-100/50 rounded-2xl border border-gray-200/60 overflow-hidden">
                    {/* Header da Coluna */}
                    <div className={`p-4 border-b border-gray-200 bg-white flex justify-between items-center sticky top-0 z-10 ${col.border}`}>
                        <h3 className={`font-black text-sm uppercase tracking-widest flex items-center gap-2 ${col.headerColor}`}>
                            <span className="text-xl">{col.icon}</span> {col.label}
                        </h3>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-black min-w-[24px] text-center">
                            {ordersInColumn.length}
                        </span>
                    </div>

                    {/* Lista de Pedidos */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {ordersInColumn.map(order => {
                            const isLate = isCritical(order.data, order.status);
                            const entregador = entregadores.find(e => e.id === order.entregadorId);

                            return (
                                <div key={order.id} className={`flex flex-col bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${isLate ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'}`}>
                                    {/* Cabeçalho do Card */}
                                    <div className="p-4 border-b border-dashed border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{order.id.slice(-4)} • {order.tipoEntrega === 'retirada' ? 'Retirada' : 'Entrega'}</span>
                                                <h4 className="font-bold text-gray-800 text-base leading-tight mt-0.5">{order.clienteNome}</h4>
                                            </div>
                                            <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider whitespace-nowrap ${isLate ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 text-gray-500'}`}>
                                                há {getElapsedTime(order.data)}
                                            </div>
                                        </div>
                                        
                                        {order.endereco && order.tipoEntrega !== 'retirada' && (
                                            <div className="flex items-start gap-1.5 text-xs text-gray-500 font-medium bg-gray-50 p-2 rounded-lg leading-snug">
                                                <span className="mt-0.5">📍</span> {order.endereco}
                                            </div>
                                        )}
                                        {entregador && (
                                            <div className="flex items-center gap-2 mt-2 bg-purple-50 p-2 rounded-lg border border-purple-100">
                                                <div className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-[9px] font-black text-purple-700">
                                                    {entregador.nome.charAt(0)}
                                                </div>
                                                <span className="text-xs font-bold text-purple-800">{entregador.nome}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Corpo do Card: Itens */}
                                    <div className="p-4 bg-[#fafbfc]">
                                        <div className="space-y-2">
                                            {order.itens.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                    <div className="flex gap-2 text-gray-700">
                                                        <span className="font-black w-5">{item.qtd}x</span>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium leading-tight">{item.nome}</span>
                                                            {item.detalhe && (
                                                                <span className="text-[10px] text-gray-400 italic leading-tight mt-0.5">{item.detalhe}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Rodapé do Card: Totais e Ações */}
                                    <div className="p-4 pt-2 mt-auto">
                                        <div className="flex justify-between items-center mb-4 pt-3 border-t border-gray-100">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total</span>
                                                <span className="text-lg font-black text-gray-900 leading-none">{formatCurrency(order.valor)}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pagamento</span>
                                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">{order.metodoPagamento || 'Não Inf.'}</span>
                                            </div>
                                        </div>

                                        {/* Botões de Ação Contextuais */}
                                        {col.status === 'pendente' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => atualizarStatusPedido(order.id, 'cancelada')} className="flex-1 py-3 bg-white border border-gray-200 text-red-500 rounded-xl font-bold text-xs uppercase hover:bg-red-50 transition-colors">Rejeitar</button>
                                                <button onClick={() => atualizarStatusPedido(order.id, 'preparando')} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-md shadow-blue-200 hover:bg-blue-500 transition-colors">Aceitar</button>
                                            </div>
                                        )}
                                        {col.status === 'preparando' && (
                                            <button onClick={() => atualizarStatusPedido(order.id, 'pronto')} className="w-full py-3 bg-orange-500 text-white rounded-xl font-black text-xs uppercase shadow-md shadow-orange-200 hover:bg-orange-400 transition-colors flex items-center justify-center gap-2">
                                                <span>✅</span> Pronto para Entrega
                                            </button>
                                        )}
                                        {col.status === 'pronto' && order.tipoEntrega !== 'retirada' && (
                                            <button onClick={() => setSelectingCourierForOrder(order.id)} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-md shadow-emerald-200 hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                                                <span>🛵</span> Chamar Entregador
                                            </button>
                                        )}
                                        {col.status === 'pronto' && order.tipoEntrega === 'retirada' && (
                                            <button onClick={() => atualizarStatusPedido(order.id, 'finalizada')} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase shadow-md shadow-emerald-200 hover:bg-emerald-500 transition-colors">
                                                Entregue ao Cliente
                                            </button>
                                        )}
                                        {col.status === 'em_transito' && (
                                            <button onClick={() => atualizarStatusPedido(order.id, 'finalizada')} className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-xs uppercase hover:bg-gray-200 transition-colors">
                                                Forçar Conclusão
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {ordersInColumn.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 min-h-[200px]">
                                <span className="text-4xl mb-2 opacity-50">{col.icon}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest">Sem pedidos</span>
                            </div>
                        )}
                    </div>
                </div>
            );
          })}
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
