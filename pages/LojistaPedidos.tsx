
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Entrega } from '../types';

export const LojistaPedidos = () => {
  const navigate = useNavigate();
  const { entregas, entregadores, lojas, atualizarStatusPedido, atribuirEntregador, addNotification, user, updateEntrega } = useStore();
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

  const handleMarkAsPaid = (e: React.MouseEvent, order: Entrega) => {
    e.stopPropagation();
    
    let nextStatus: Entrega['status'] | undefined;
    if (order.status === 'pendente') nextStatus = 'preparando';
    else if (order.status === 'preparando') nextStatus = 'pronto';
    
    if (!nextStatus) return;

    // Atualiza pagamento e status
    const currentPayment = order.metodoPagamento || 'Não informado';
    // Evita duplicar "(Pago)" se já tiver
    const newPayment = currentPayment.toLowerCase().includes('(pago)') 
        ? currentPayment 
        : `${currentPayment} (Pago)`;

    updateEntrega(order.id, {
        status: nextStatus,
        metodoPagamento: newPayment
    });
    
    addNotification('success', `Pedido #${order.id.slice(-4)} marcado como pago e movido para ${nextStatus === 'preparando' ? 'Cozinha' : 'Pronto'}!`);
  };

  const imprimirComanda = (pedido: Entrega) => {
    const loja = lojas.find(l => l.id === pedido.lojaId);
    const janela = window.open('', '', 'width=350,height=600');
    
    if (janela) {
        janela.document.write(`
            <html>
            <head>
                <title>Pedido #${pedido.id.slice(-4)}</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; margin: 0 auto; padding: 10px; color: #000; }
                    .header { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
                    .header h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
                    .info { margin-bottom: 10px; font-size: 11px; }
                    .items { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                    .items th { text-align: left; border-bottom: 1px solid #000; }
                    .items td { padding: 4px 0; vertical-align: top; }
                    .qty { font-weight: bold; width: 30px; }
                    .price { text-align: right; }
                    .totals { margin-top: 10px; border-top: 1px dashed #000; padding-top: 10px; }
                    .row { display: flex; justify-content: space-between; margin-bottom: 2px; }
                    .total { font-size: 14px; font-weight: bold; margin-top: 5px; }
                    .footer { margin-top: 20px; text-align: center; font-size: 10px; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>${loja?.nome || 'Pede Mais'}</h2>
                    <p>Pedido: <strong>#${pedido.id.slice(-4)}</strong></p>
                    <p>${new Date(pedido.data).toLocaleString('pt-BR')}</p>
                </div>
                
                <div class="info">
                    <strong>CLIENTE:</strong><br/>
                    ${pedido.clienteNome}<br/>
                    ${pedido.tipoEntrega === 'retirada' ? '⚠️ RETIRADA NO BALCÃO' : `📍 ${pedido.endereco}`}
                </div>

                <table class="items">
                    <thead>
                        <tr><th class="qty">Qtd</th><th>Item</th><th class="price">R$</th></tr>
                    </thead>
                    <tbody>
                        ${pedido.itens.map(item => `
                            <tr>
                                <td class="qty">${item.qtd}</td>
                                <td>
                                    ${item.nome}
                                    ${item.detalhe ? `<br/><i style="font-size:10px">(${item.detalhe})</i>` : ''}
                                </td>
                                <td class="price">${((item.preco || 0) * item.qtd).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="row"><span>Subtotal:</span> <span>${formatCurrency(pedido.itens.reduce((acc, i) => acc + ((i.preco || 0) * i.qtd), 0))}</span></div>
                    <div class="row"><span>Taxa Entrega:</span> <span>${formatCurrency(pedido.tipoEntrega === 'retirada' ? 0 : (loja?.taxaEntrega || 0))}</span></div>
                    <div class="row total"><span>TOTAL:</span> <span>${formatCurrency(pedido.valor)}</span></div>
                    <br/>
                    <div class="row"><span>Pagamento:</span> <strong>${pedido.metodoPagamento || 'A Combinar'}</strong></div>
                </div>

                <div class="footer">
                    <p>Obrigado pela preferência!</p>
                    <p>www.pedemais.app</p>
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
        janela.document.close();
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
            <button 
                onClick={() => navigate('/meus-pedidos')}
                className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-lg font-black text-[11px] uppercase tracking-wider hover:bg-blue-100 transition-colors whitespace-nowrap"
            >
                Ver Meus Pedidos
            </button>

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
                                <div key={order.id} className={`flex flex-col bg-white rounded-xl shadow-sm border transition-all hover:shadow-md animate-fade-in ${isLate ? 'border-red-300 ring-1 ring-red-100' : 'border-gray-200'}`}>
                                    {/* Cabeçalho do Card */}
                                    <div className="p-4 border-b border-dashed border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">#{order.id.slice(-4)}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newType = order.tipoEntrega === 'retirada' ? 'entrega' : 'retirada';
                                                            updateEntrega(order.id, { tipoEntrega: newType });
                                                            addNotification('info', `Pedido alterado para ${newType === 'retirada' ? 'Pegue e Leve' : 'Entrega'}`);
                                                        }}
                                                        className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded cursor-pointer border hover:shadow-sm transition-all flex items-center gap-1 ${order.tipoEntrega === 'retirada' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
                                                        title="Alternar modo de entrega"
                                                    >
                                                        {order.tipoEntrega === 'retirada' ? '🛍️ Pegue e Leve' : '🛵 Entrega'}
                                                    </button>
                                                    <button onClick={() => imprimirComanda(order)} className="text-gray-400 hover:text-gray-900 transition-colors ml-1" title="Imprimir Comanda">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1 2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                                    </button>
                                                </div>
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
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${order.metodoPagamento?.toLowerCase().includes('pago') ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}>
                                                    {order.metodoPagamento || 'Não Inf.'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Botões de Ação Contextuais */}
                                        {col.status === 'pendente' && (
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={(e) => handleMarkAsPaid(e, order)}
                                                    className="w-full py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    💲 Marcar como Pago & Aceitar
                                                </button>
                                                <div className="flex gap-2">
                                                    <button onClick={() => atualizarStatusPedido(order.id, 'cancelada')} className="flex-1 py-3 bg-white border border-gray-200 text-red-500 rounded-xl font-bold text-xs uppercase hover:bg-red-50 transition-colors">Rejeitar</button>
                                                    <button onClick={() => atualizarStatusPedido(order.id, 'preparando')} className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-md shadow-blue-200 hover:bg-blue-500 transition-colors">Aceitar</button>
                                                </div>
                                            </div>
                                        )}
                                        {col.status === 'preparando' && (
                                            <div className="flex flex-col gap-2">
                                                <button 
                                                    onClick={(e) => handleMarkAsPaid(e, order)}
                                                    className="w-full py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black text-[10px] uppercase hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    💲 Marcar como Pago & Pronto
                                                </button>
                                                <button onClick={() => atualizarStatusPedido(order.id, 'pronto')} className="w-full py-3 bg-orange-500 text-white rounded-xl font-black text-xs uppercase shadow-md shadow-orange-200 hover:bg-orange-400 transition-colors flex items-center justify-center gap-2">
                                                    <span>✅</span> {order.tipoEntrega === 'retirada' ? 'Pronto p/ Retirada' : 'Pronto p/ Entrega'}
                                                </button>
                                            </div>
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
