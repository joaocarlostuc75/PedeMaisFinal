
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

        // Mantém a data mais recente
        if (new Date(order.data) > new Date(client.lastOrderDate)) {
          client.lastOrderDate = order.data;
          client.address = order.endereco; // Endereço mais recente
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

      <div className="flex gap-8 flex-1 overflow-hidden">
          {/* Lista de Clientes */}
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
                                className={`cursor-pointer transition-colors hover:bg-emerald-50/30 ${selectedClient?.name === client.name ? 'bg-emerald-50 ring-1 ring-emerald-100' : ''}`}
                              >
                                  <td className="p-6">
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-400 shrink-0">
                                              {client.name.charAt(0)}
                                          </div>
                                          <div>
                                              <p className="font-black text-gray-800 text-sm">{client.name}</p>
                                              <p className="text-[10px] text-gray-400 font-bold">{client.phone}</p>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-6 hidden md:table-cell">
                                      <span className="font-black text-emerald-600">{formatCurrency(client.totalSpent)}</span>
                                  </td>
                                  <td className="p-6 hidden md:table-cell">
                                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">{client.orderCount}</span>
                                  </td>
                                  <td className="p-6">
                                      <p className="text-xs font-bold text-gray-500">{formatDate(client.lastOrderDate).split(',')[0]}</p>
                                  </td>
                              </tr>
                          ))}
                          {filteredClients.length === 0 && (
                              <tr>
                                  <td colSpan={4} className="p-10 text-center text-gray-400 font-bold text-sm">Nenhum cliente encontrado.</td>
                              </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>

          {/* Detalhes do Cliente (Side Panel) */}
          {selectedClient && (
              <div className="w-full md:w-[400px] bg-white rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col overflow-hidden animate-fade-in shrink-0">
                  <div className="p-8 bg-gray-900 text-white relative overflow-hidden shrink-0">
                      <div className="relative z-10 flex flex-col items-center text-center">
                          <div className="w-20 h-20 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-3xl font-black mb-4 shadow-lg">
                              {selectedClient.name.charAt(0)}
                          </div>
                          <h2 className="text-xl font-black leading-tight">{selectedClient.name}</h2>
                          <p className="text-gray-400 text-sm mt-1 font-medium">{selectedClient.phone}</p>
                          <div className="mt-6 flex gap-4 w-full">
                              <div className="flex-1 bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Total Gasto</p>
                                  <p className="text-lg font-bold">{formatCurrency(selectedClient.totalSpent)}</p>
                              </div>
                              <div className="flex-1 bg-white/10 rounded-2xl p-3 backdrop-blur-sm">
                                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Pedidos</p>
                                  <p className="text-lg font-bold">{selectedClient.orderCount}</p>
                              </div>
                          </div>
                      </div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-20 pointer-events-none" />
                  </div>

                  <div className="p-6 flex-1 overflow-y-auto bg-[#fafbfc]">
                      <div className="mb-6">
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Ações Rápidas (WhatsApp)</h3>
                          <div className="grid grid-cols-2 gap-3">
                              <button 
                                onClick={() => handleSendPromo('discount')}
                                className="bg-white border border-gray-200 p-4 rounded-2xl hover:border-emerald-500 hover:text-emerald-600 transition-all group text-left"
                              >
                                  <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">🏷️</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">Enviar Cupom</span>
                              </button>
                              <button 
                                onClick={() => handleSendPromo('gift')}
                                className="bg-white border border-gray-200 p-4 rounded-2xl hover:border-purple-500 hover:text-purple-600 transition-all group text-left"
                              >
                                  <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">🎁</span>
                                  <span className="text-[10px] font-black uppercase tracking-widest">Oferecer Brinde</span>
                              </button>
                          </div>
                      </div>

                      <div>
                          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Histórico Recente</h3>
                          <div className="space-y-3">
                              {selectedClient.orders.slice(0, 5).map((ord: any) => (
                                  <div key={ord.id} className="bg-white p-3 rounded-xl border border-gray-100 text-sm">
                                      <div className="flex justify-between mb-1">
                                          <span className="font-black text-gray-800">{formatCurrency(ord.valor)}</span>
                                          <span className="text-[10px] text-gray-400 font-bold">{formatDate(ord.data).split(' ')[0]}</span>
                                      </div>
                                      <p className="text-xs text-gray-500 line-clamp-1">{ord.itens.map((i: any) => i.nome).join(', ')}</p>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-6 border-t border-gray-100 bg-white">
                      <button onClick={() => setSelectedClient(null)} className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-xs uppercase hover:bg-gray-200">Fechar Detalhes</button>
                  </div>
              </div>
          )}
      </div>
    </div>
  );
};
