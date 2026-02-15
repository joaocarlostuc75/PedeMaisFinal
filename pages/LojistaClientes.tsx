
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
        // Usa o nome como chave primária simplificada (em produção seria ID ou Telefone)
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
        
        // Atualiza telefone se encontrado em pedido mais recente
        if (order.clienteTelefone && (!client.phone || client.phone === 'Não informado')) {
            client.phone = order.clienteTelefone;
        }

        // Mantém a data e endereço mais recentes
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-20 h-[calc(100vh-80px)] flex flex-col">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Meus Clientes</h1>
          <p className="text-gray-500 font-medium mt-1">Conheça seu público e fidelize com promoções diretas.</p>
        </div>
        <div className="relative w-full md:w-80">
            <input 
                type="text" 
                placeholder="Buscar por nome ou telefone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </header>

      {/* Lista de Clientes (Tabela Full Width) */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50/50 sticky top-0 z-10">
                      <tr>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-[2rem]">Cliente</th>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">LTV (Gasto Total)</th>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest hidden md:table-cell">Pedidos</th>
                          <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tr-[2rem]">Última Compra</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {filteredClients.map((client, idx) => (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedClient(client)}
                            className="cursor-pointer transition-colors hover:bg-emerald-50/30 group"
                          >
                              <td className="p-6">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400 text-lg shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                          {client.name.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="font-black text-gray-800 text-base">{client.name}</p>
                                          <p className="text-xs text-gray-400 font-bold">{client.phone}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="p-6 hidden md:table-cell">
                                  <span className="font-black text-emerald-600 text-lg">{formatCurrency(client.totalSpent)}</span>
                              </td>
                              <td className="p-6 hidden md:table-cell">
                                  <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-black">{client.orderCount} pedidos</span>
                              </td>
                              <td className="p-6">
                                  <p className="text-xs font-bold text-gray-500">{formatDate(client.lastOrderDate)}</p>
                              </td>
                          </tr>
                      ))}
                      {filteredClients.length === 0 && (
                          <tr>
                              <td colSpan={4} className="p-20 text-center text-gray-300">
                                  <span className="text-4xl block mb-2">🕵️</span>
                                  <span className="text-sm font-bold uppercase tracking-widest">Nenhum cliente encontrado</span>
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Modal de Detalhes do Cliente (Novo Design) */}
      {selectedClient && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedClient(null)}>
              <div className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                  
                  {/* Header do Modal */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-white shrink-0">
                      <button 
                        onClick={() => setSelectedClient(null)} 
                        className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white font-bold transition-all"
                      >
                        ✕
                      </button>
                      
                      <div className="flex flex-col items-center text-center">
                          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-4xl font-black mb-4 shadow-xl ring-4 ring-white/10">
                              {selectedClient.name.charAt(0)}
                          </div>
                          <h2 className="text-3xl font-black tracking-tight">{selectedClient.name}</h2>
                          <div className="flex items-center gap-2 mt-2 text-white/60 font-medium text-sm">
                             <span>📞 {selectedClient.phone}</span>
                             {selectedClient.address && (
                                <>
                                    <span>•</span>
                                    <span>📍 {selectedClient.address}</span>
                                </>
                             )}
                          </div>
                      </div>

                      {/* Métricas Rápidas */}
                      <div className="grid grid-cols-3 gap-4 mt-8">
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/5">
                              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-300 mb-1">Total Gasto</p>
                              <p className="text-xl font-bold">{formatCurrency(selectedClient.totalSpent)}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/5">
                              <p className="text-[9px] font-black uppercase tracking-widest text-blue-300 mb-1">Pedidos</p>
                              <p className="text-xl font-bold">{selectedClient.orderCount}</p>
                          </div>
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/5">
                              <p className="text-[9px] font-black uppercase tracking-widest text-purple-300 mb-1">Ticket Médio</p>
                              <p className="text-xl font-bold">{formatCurrency(calculateTicketMedio(selectedClient.totalSpent, selectedClient.orderCount))}</p>
                          </div>
                      </div>
                  </div>

                  {/* Corpo do Modal */}
                  <div className="flex-1 overflow-y-auto bg-[#fafbfc] p-8 custom-scrollbar">
                      
                      {/* Ações de Marketing */}
                      <div className="mb-8">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Fidelização Rápida</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <button 
                                onClick={() => handleSendPromo('discount')}
                                className="bg-white border border-gray-200 p-5 rounded-[1.5rem] hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group text-left flex items-center gap-4"
                              >
                                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🏷️</div>
                                  <div>
                                      <span className="block font-black text-gray-800 text-sm group-hover:text-emerald-600">Enviar Cupom</span>
                                      <span className="text-[10px] text-gray-400 font-bold">Via WhatsApp</span>
                                  </div>
                              </button>
                              <button 
                                onClick={() => handleSendPromo('gift')}
                                className="bg-white border border-gray-200 p-5 rounded-[1.5rem] hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 transition-all group text-left flex items-center gap-4"
                              >
                                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🎁</div>
                                  <div>
                                      <span className="block font-black text-gray-800 text-sm group-hover:text-purple-600">Oferecer Brinde</span>
                                      <span className="text-[10px] text-gray-400 font-bold">Via WhatsApp</span>
                                  </div>
                              </button>
                          </div>
                      </div>

                      {/* Histórico */}
                      <div>
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Histórico de Pedidos ({selectedClient.orders.length})</h3>
                          <div className="space-y-3">
                              {selectedClient.orders.slice().reverse().map((ord: any) => (
                                  <div key={ord.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center hover:border-gray-300 transition-colors">
                                      <div>
                                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{formatDate(ord.data)}</p>
                                          <p className="text-sm font-bold text-gray-700 line-clamp-1 max-w-[200px] md:max-w-xs">
                                              {ord.itens.map((i: any) => `${i.qtd}x ${i.nome}`).join(', ')}
                                          </p>
                                      </div>
                                      <div className="text-right">
                                          <p className="font-black text-emerald-600">{formatCurrency(ord.valor)}</p>
                                          <span className="text-[9px] font-black uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-500">{ord.status}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-6 border-t border-gray-100 bg-white shrink-0 flex justify-end">
                      <button onClick={() => setSelectedClient(null)} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-black text-xs uppercase hover:bg-gray-200 transition-all">Fechar</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
