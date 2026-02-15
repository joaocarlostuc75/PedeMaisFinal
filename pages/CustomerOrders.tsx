
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';

export const CustomerOrders = () => {
  const navigate = useNavigate();
  const { entregas, myOrderIds, lojas } = useStore();

  // Filtra e ordena os pedidos do cliente
  const meusPedidos = entregas
    .filter(e => myOrderIds.includes(e.id))
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente': return { label: 'Aguardando Aprovação', color: 'bg-blue-100 text-blue-700', icon: '⏳' };
      case 'preparando': return { label: 'Em Preparo', color: 'bg-orange-100 text-orange-700', icon: '🔥' };
      case 'pronto': return { label: 'Pronto para Entrega', color: 'bg-emerald-100 text-emerald-700', icon: '📦' };
      case 'em_transito': return { label: 'Saiu para Entrega', color: 'bg-purple-100 text-purple-700', icon: '🛵' };
      case 'finalizada': return { label: 'Entregue', color: 'bg-gray-100 text-gray-600', icon: '✅' };
      case 'cancelada': return { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: '❌' };
      default: return { label: status, color: 'bg-gray-100 text-gray-600', icon: '❓' };
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-20">
      <header className="bg-white px-6 py-6 border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-gray-800 transition-colors uppercase tracking-widest">
                <span>←</span> Voltar
            </button>
            <h1 className="text-lg font-black text-gray-900 tracking-tight">Meus Pedidos</h1>
            <div className="w-8" /> 
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pt-8 space-y-6">
        {meusPedidos.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                <span className="text-5xl block mb-4">🛍️</span>
                <h3 className="text-xl font-bold text-gray-800">Nenhum pedido encontrado</h3>
                <p className="text-gray-400 text-sm mt-2 mb-6">Você ainda não fez nenhum pedido por este dispositivo.</p>
                <button onClick={() => navigate('/')} className="text-emerald-600 font-black uppercase text-xs hover:underline">Ir para a Loja</button>
            </div>
        ) : (
            meusPedidos.map(pedido => {
                const statusInfo = getStatusInfo(pedido.status);
                const loja = lojas.find(l => l.id === pedido.lojaId);
                const totalItens = pedido.itens.reduce((acc, i) => acc + i.qtd, 0);

                return (
                    <div 
                        key={pedido.id} 
                        onClick={() => navigate(`/rastreio/${pedido.id}`)}
                        className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-4 pb-4 border-b border-dashed border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                    {loja?.logo ? <img src={loja.logo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🏪</div>}
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900 leading-tight">{loja?.nome || 'Loja'}</h4>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{formatDate(pedido.data)}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${statusInfo.color}`}>
                                {statusInfo.icon} {statusInfo.label}
                            </span>
                        </div>

                        <div className="space-y-1 mb-4">
                            {pedido.itens.slice(0, 2).map((item, idx) => (
                                <p key={idx} className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                    <span className="font-black text-gray-300 text-xs">{item.qtd}x</span> {item.nome}
                                </p>
                            ))}
                            {pedido.itens.length > 2 && (
                                <p className="text-[10px] font-bold text-gray-400 italic mt-1">+ {pedido.itens.length - 2} outros itens...</p>
                            )}
                        </div>

                        <div className="flex justify-between items-center pt-2">
                            <p className="text-xs font-bold text-gray-400">{totalItens} itens</p>
                            <div className="flex items-center gap-3">
                                <p className="font-black text-lg text-gray-900">{formatCurrency(pedido.valor)}</p>
                                <span className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">→</span>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </main>
    </div>
  );
};
