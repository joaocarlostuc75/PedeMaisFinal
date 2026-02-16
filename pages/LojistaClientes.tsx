
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';

export const LojistaClientes = () => {
  const { entregas, user } = useStore();
  const currentLojaId = user?.lojaId || 'l1';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);

  // Agrega dados dos clientes com base no histórico de pedidos
  const clientsData = useMemo(() => {
    const clientsMap = new Map();

    entregas
      .filter(e => e.lojaId === currentLojaId)
      .forEach(order => {
        const key = order.clienteNome;
        
        if (!clientsMap.has(key)) {
          clientsMap.set(key, {
            name: order.clienteNome,
            phone: order.clienteTelefone || 'Não informado',
            totalSpent: 0,
            orderCount: 0,
            lastOrderDate: order.data,
            orders: [], // Para o histórico
            address: order.endereco
          });
        }

        const client = clientsMap.get(key);
        client.totalSpent += order.valor;
        client.orderCount += 1;
        client.orders.push(order);
        
        if (order.clienteTelefone && (!client.phone || client.phone === 'Não informado')) {
            client.phone = order.clienteTelefone;
        }

        if (new Date(order.data) > new Date(client.lastOrderDate)) {
          client.lastOrderDate = order.data;
          if (order.endereco && order.tipoEntrega !== 'retirada') {
             client.address = order.endereco; 
          }
        }
      });

    return Array.from(clientsMap.values())
      .sort((a, b) => new Date(b.lastOrderDate).getTime() - new Date(a.lastOrderDate).getTime());
  }, [entregas, currentLojaId]);

  const filteredClients = clientsData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleSendPromo = (type: 'discount' | 'gift') => {
    if (!selectedClient || selectedClient.phone === 'Não informado') {
        alert('Este cliente não possui telefone cadastrado.');
        return;
    }

    let message = '';
    if (type === 'discount') {
        message = `Olá ${selectedClient.name}! 🌟 Saudades de você no Pede Mais. Preparamos um cupom de 10% DE DESCONTO para seu próximo pedido: *VOLTA10*. Aproveite hoje! 🍕`;
    } else {
        message = `Oi ${selectedClient.name}! 🎁 Que tal um agrado? Peça hoje e ganhe um *Brinde Especial* por nossa conta. É só avisar que recebeu esta mensagem! 🍔`;
    }

    const url = `https://wa.me/${selectedClient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const calculateTicketMedio = (total: number, count: number) => {
      return count > 0 ? total / count : 0;
  };

  // Função para calcular métricas de engajamento
  const calculateEngagement = (orders: any[]) => {
    if (!orders || orders.length === 0) return { avgDays: 0, status: 'Novo', daysSinceLast: 0 };

    const sortedDates = orders
        .map(o => new Date(o.data).getTime())
        .sort((a, b) => a - b);

    const first = sortedDates[0];
    const last = sortedDates[sortedDates.length - 1];
    
    // Cálculo de dias desde a última compra
    const now = new Date().getTime();
    const daysSinceLast = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    // Cálculo da média de dias entre compras (Ciclo)
    let avgDays = 0;
    if (orders.length > 1) {
        const totalDaysRange = (last - first) / (1000 * 60 * 60 * 24);
        avgDays = Math.round(totalDaysRange / (orders.length - 1));
    }

    // Definição de Status
    let status = 'Regular';
    let statusColor = 'bg-blue-100 text-blue-700';

    if (orders.length === 1) {
        status = 'Novo Cliente';
        statusColor = 'bg-emerald-100 text-emerald-700';
    } else if (daysSinceLast > 45) {
        status = 'Em Risco ⚠️';
        statusColor = 'bg-red-100 text-red-700';
    } else if (daysSinceLast > 90) {
        status = 'Inativo 💤';
        statusColor = 'bg-gray-100 text-gray-500';
    } else if (avgDays < 10 && orders.length > 3) {
        status = 'Super Fã 🔥';
        statusColor = 'bg-purple-100 text-purple-700';
    } else if (avgDays < 30) {
        status = 'Fiel ✅';
        statusColor = 'bg-emerald-100 text-emerald-700';
    }

    return { avgDays, status, statusColor, daysSinceLast };
  };

  // Calcula engajamento apenas se houver cliente selecionado
  const engagement = selectedClient ? calculateEngagement(selectedClient.orders) : null;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-20 h-[calc(100vh-80px)] flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">Meus Clientes</h1>
          <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">Conheça seu público e fidelize com promoções diretas.</p>
        </div>
        <div className="relative w-full md:w-80">
            <input 
                type="text" 
                placeholder="Buscar por nome ou telefone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </header>

      {/* Lista de Clientes (Tabela) */}
      <div className="flex-1 bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 sticky top-0 z-10">
                      <tr>
                          <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-[2rem]">Cliente</th>
                          <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">LTV (Gasto Total)</th>
                          <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Pedidos</th>
                          <th className="p-4 md:p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tr-[2rem]">Última Compra</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {filteredClients.map((client, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedClient(client)}
                            className="cursor-pointer transition-colors hover:bg-emerald-50/30 group"
                          >
                              <td className="p-4 md:p-6">
                                  <div className="flex items-center gap-3 md:gap-4">
                                      <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400 text-sm md:text-lg shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors uppercase">
                                          {client.name.charAt(0)}
                                      </div>
                                      <div className="min-w-0">
                                          <p className="font-black text-gray-800 text-sm md:text-base truncate">{client.name}</p>
                                          <p className="text-[10px] md:text-xs text-gray-400 font-bold truncate">{client.phone}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-4 md:p-6 hidden md:table-cell">
                                  <span className="font-black text-emerald-600 text-base md:text-lg">{formatCurrency(client.totalSpent)}</span>
                              </td>
                              <td className="p-4 md:p-6 hidden md:table-cell">
                                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-black">{client.orderCount} pedidos</span>
                              </td>
                              <td className="p-4 md:p-6">
                                  <div className="flex flex-col md:block">
                                    <p className="text-xs font-bold text-gray-500">{formatDate(client.lastOrderDate)}</p>
                                    <span className="md:hidden text-[10px] text-emerald-600 font-black mt-1">{formatCurrency(client.totalSpent)}</span>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {filteredClients.length === 0 && (
                          <tr>
                              <td colSpan={4} className="p-12 text-center text-gray-300">
                                  <span className="text-3xl md:text-4xl block mb-2">🕵️</span>
                                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest">Nenhum cliente encontrado</span>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Modal de Detalhes do Cliente (Bottom Sheet em Mobile / Modal em Desktop) */}
      {selectedClient && engagement && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center md:p-4 animate-fade-in" onClick={() => setSelectedClient(null)}>
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              
              {/* Card Content */}
              <div 
                className="relative bg-white w-full h-[90vh] md:h-auto md:max-h-[90vh] md:w-[800px] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-slide-up-mobile md:animate-bounce-in"
                onClick={e => e.stopPropagation()}
              >
                  
                  {/* Header Sticky */}
                  <div className="p-6 md:p-8 bg-white border-b border-gray-100 sticky top-0 z-10 shrink-0">
                      {/* Mobile Handle */}
                      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden" />

                      <button 
                        onClick={() => setSelectedClient(null)} 
                        className="absolute top-6 right-6 w-8 h-8 md:w-10 md:h-10 bg-gray-50 hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold transition-all"
                      >
                        ✕
                      </button>
                      
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-emerald-400 to-emerald-600 rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl font-black text-white shadow-lg shadow-emerald-200 uppercase shrink-0">
                              {selectedClient.name.charAt(0)}
                          </div>
                          <div className="text-center sm:text-left flex-1 min-w-0 w-full">
                              <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter leading-tight truncate">{selectedClient.name}</h2>
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-gray-500 text-xs md:text-sm font-medium justify-center sm:justify-start items-center sm:items-start">
                                 <span className="flex items-center gap-1"><span className="text-lg">📞</span> {selectedClient.phone}</span>
                                 {selectedClient.address && (
                                    <span className="flex items-center gap-1 text-center sm:text-left"><span className="text-lg">📍</span> <span className="line-clamp-1">{selectedClient.address}</span></span>
                                 )}
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Corpo com Scroll */}
                  <div className="flex-1 overflow-y-auto bg-[#fafbfc] p-6 md:p-8 custom-scrollbar space-y-8">
                      
                      {/* KPIs Cards - Responsive Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                          <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 text-lg">💰</div>
                              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Total Gasto</p>
                              <p className="text-sm md:text-lg font-black text-gray-900">{formatCurrency(selectedClient.totalSpent)}</p>
                          </div>
                          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center">
                              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2 text-lg">🛍️</div>
                              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Pedidos</p>
                              <p className="text-sm md:text-lg font-black text-gray-900">{selectedClient.orderCount}</p>
                          </div>
                          <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-purple-100 shadow-sm flex flex-col items-center justify-center text-center">
                              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-2 text-lg">🎫</div>
                              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400">Ticket Médio</p>
                              <p className="text-sm md:text-lg font-black text-gray-900">{formatCurrency(calculateTicketMedio(selectedClient.totalSpent, selectedClient.orderCount))}</p>
                          </div>
                      </div>

                      {/* Análise de Engajamento */}
                      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                          <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                              📊 Análise de Engajamento
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
                              <div className="text-center pb-4 sm:pb-0">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status Fidelidade</p>
                                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${engagement.statusColor}`}>
                                      {engagement.status}
                                  </span>
                              </div>
                              <div className="text-center py-4 sm:py-0">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ciclo de Compra</p>
                                  <p className="text-xl font-black text-gray-800">
                                      {engagement.avgDays === 0 ? '---' : `${engagement.avgDays} dias`}
                                  </p>
                                  <p className="text-[9px] text-gray-400 font-bold">Média entre pedidos</p>
                              </div>
                              <div className="text-center pt-4 sm:pt-0">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Última Visita</p>
                                  <p className="text-xl font-black text-gray-800">{engagement.daysSinceLast} dias</p>
                                  <p className="text-[9px] text-gray-400 font-bold">atrás</p>
                              </div>
                          </div>
                      </div>

                      {/* Ações de Marketing */}
                      <div>
                          <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                              ⚡ Ações Rápidas
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => handleSendPromo('discount')}
                                className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-500 transition-all flex flex-col items-center gap-2 text-center active:scale-95 group"
                              >
                                  <span className="text-2xl group-hover:scale-110 transition-transform">🏷️</span>
                                  <span className="font-black text-[10px] md:text-xs uppercase tracking-wide leading-tight">Cupom 10% OFF</span>
                              </button>
                              <button 
                                onClick={() => handleSendPromo('gift')}
                                className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl hover:bg-gray-800 transition-all flex flex-col items-center gap-2 text-center active:scale-95 group"
                              >
                                  <span className="text-2xl group-hover:scale-110 transition-transform">🎁</span>
                                  <span className="font-black text-[10px] md:text-xs uppercase tracking-wide leading-tight">Oferecer Brinde</span>
                              </button>
                          </div>
                      </div>

                      {/* Histórico */}
                      <div className="pb-10">
                          <h3 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                              📜 Histórico Recente
                          </h3>
                          <div className="space-y-3">
                              {selectedClient.orders.slice().reverse().map((ord: any) => (
                                  <div key={ord.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:border-emerald-200 transition-colors">
                                      <div className="bg-gray-50 w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 border border-gray-100">
                                          <span className="text-[10px] font-black text-gray-400 uppercase leading-none">{new Date(ord.data).getDate()}</span>
                                          <span className="text-[9px] font-bold text-gray-300 uppercase leading-none mt-0.5">{new Date(ord.data).toLocaleDateString('pt-BR', {month:'short'}).replace('.','')}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                          <p className="text-xs font-bold text-gray-800 line-clamp-1">
                                              {ord.itens.map((i: any) => `${i.qtd}x ${i.nome}`).join(', ')}
                                          </p>
                                          <p className="text-[10px] text-gray-400 mt-0.5">Pedido #{ord.id.slice(-4)}</p>
                                      </div>
                                      <div className="text-right shrink-0">
                                          <p className="font-black text-emerald-600 text-sm">{formatCurrency(ord.valor)}</p>
                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${ord.status === 'finalizada' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                              {ord.status}
                                          </span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                  
                  {/* Footer Mobile Only */}
                  <div className="p-4 bg-white border-t border-gray-100 md:hidden shrink-0">
                      <button onClick={() => setSelectedClient(null)} className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-xs uppercase hover:bg-gray-200 transition-all">Fechar Detalhes</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
