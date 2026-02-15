
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';

export const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entregas, lojas, entregadores } = useStore();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Atualiza o componente a cada 30s para atualizar tempos relativos
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const pedido = entregas.find(e => e.id === id);
  const loja = pedido ? lojas.find(l => l.id === pedido.lojaId) : null;
  const entregador = pedido?.entregadorId ? entregadores.find(e => e.id === pedido.entregadorId) : null;

  if (!pedido || !loja) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Pedido não encontrado</h1>
        <p className="text-gray-400 mb-8">Verifique o link ou volte para seus pedidos.</p>
        <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black">Voltar ao Início</button>
      </div>
    );
  }

  // Definição dos passos da Timeline
  const steps = [
    { id: 'pendente', label: 'Recebido', icon: '📝', desc: 'Aguardando confirmação' },
    { id: 'preparando', label: 'Preparando', icon: '🔥', desc: 'Cozinha trabalhando' },
    { id: 'pronto', label: 'Pronto', icon: '📦', desc: 'Aguardando entregador' },
    { id: 'em_transito', label: 'A Caminho', icon: '🛵', desc: 'Saiu para entrega' },
    { id: 'finalizada', label: 'Entregue', icon: '🏠', desc: 'Pedido concluído' }
  ];

  // Índice do status atual
  const currentStepIndex = steps.findIndex(s => s.id === pedido.status);
  
  // Se for cancelado, mostra um estado especial
  const isCancelled = pedido.status === 'cancelada';

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-32">
      {/* Header com Loja */}
      <div className="bg-white pb-10 pt-6 px-6 rounded-b-[3rem] shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate('/meus-pedidos')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center font-black text-gray-400 hover:bg-gray-100 transition-colors">←</button>
                <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedido #{pedido.id.slice(-4)}</p>
                    <h1 className="font-black text-gray-900 text-lg">{loja.nome}</h1>
                </div>
                <div className="w-10" />
            </div>

            {/* Status Principal */}
            <div className="text-center mb-8">
                {isCancelled ? (
                    <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl inline-block">
                        <span className="text-3xl block mb-2">❌</span>
                        <h2 className="font-black text-xl tracking-tight">Pedido Cancelado</h2>
                        <p className="text-xs font-bold mt-1 opacity-80">Entre em contato com a loja.</p>
                    </div>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 border-4 border-white shadow-xl shadow-emerald-100">
                            {steps[currentStepIndex]?.icon || '✅'}
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
                            {steps[currentStepIndex]?.label || 'Processando'}
                        </h2>
                        <p className="text-sm font-medium text-gray-400">
                            {steps[currentStepIndex]?.desc}
                        </p>
                    </>
                )}
            </div>

            {/* Timeline Vertical */}
            {!isCancelled && (
                <div className="relative pl-4 space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                    {steps.map((step, idx) => {
                        const isActive = idx === currentStepIndex;
                        const isCompleted = idx < currentStepIndex;
                        
                        return (
                            <div key={step.id} className={`relative flex items-center gap-4 ${idx > currentStepIndex ? 'opacity-40 grayscale' : ''}`}>
                                <div className={`relative z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${
                                    isActive ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg ring-4 ring-emerald-100' :
                                    isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' :
                                    'bg-white border-gray-200 text-white'
                                }`}>
                                    {(isCompleted || isActive) && '✓'}
                                </div>
                                <div>
                                    <p className={`text-sm font-bold ${isActive ? 'text-emerald-600' : 'text-gray-800'}`}>{step.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-8 space-y-6">
        
        {/* Card do Entregador (Se houver) */}
        {entregador && pedido.status === 'em_transito' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-lg shadow-purple-50 border border-purple-100 flex items-center gap-4 animate-fade-in">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-sm">
                    🛵
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Seu Entregador</p>
                    <h3 className="font-black text-gray-800 text-lg leading-none">{entregador.nome}</h3>
                    <div className="flex gap-2 mt-1 text-xs font-bold text-gray-500">
                        <span>{entregador.tipoVeiculo}</span>
                        <span>•</span>
                        <span>{entregador.placa || 'Sem placa'}</span>
                    </div>
                </div>
            </div>
        )}

        {/* Detalhes do Pedido */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 text-lg mb-6 flex items-center gap-2">
                📄 Resumo do Pedido
            </h3>
            
            <div className="space-y-4 mb-6">
                {pedido.itens.map((item, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                        <div className="flex gap-3">
                            <span className="font-black text-emerald-600 w-5">{item.qtd}x</span>
                            <div>
                                <p className="font-bold text-gray-700">{item.nome}</p>
                                {item.detalhe && <p className="text-xs text-gray-400">{item.detalhe}</p>}
                            </div>
                        </div>
                        <span className="font-medium text-gray-500">{formatCurrency((item.preco || 0) * item.qtd)}</span>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-dashed border-gray-100 space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Taxa de Entrega</span>
                    <span>{formatCurrency(pedido.tipoEntrega === 'retirada' ? 0 : (loja.taxaEntrega || 0))}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                    <span className="font-black text-gray-900 uppercase tracking-widest text-xs">Total</span>
                    <span className="font-black text-2xl text-emerald-600 tracking-tighter">{formatCurrency(pedido.valor)}</span>
                </div>
            </div>
        </div>

        {/* Informações de Entrega */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
             <div className="flex items-start gap-4 mb-4">
                 <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">📍</div>
                 <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Endereço de Entrega</p>
                     <p className="font-bold text-gray-800 text-sm leading-relaxed">{pedido.endereco}</p>
                 </div>
             </div>
             <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl">💳</div>
                 <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pagamento</p>
                     <p className="font-bold text-gray-800 text-sm">{pedido.metodoPagamento}</p>
                 </div>
             </div>
        </div>

        <button 
            onClick={() => window.open(`https://wa.me/${loja.whatsapp}`, '_blank')}
            className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black shadow-lg shadow-green-100 hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.047-.057-.262-.069-.517-.149-1.512-.567-1.179-.494-1.925-1.635-1.984-1.712-.058-.077-.471-.625-.471-1.202 0-.577.301-.86.41-.977.108-.117.234-.146.312-.146.079 0 .158.001.228.004.075.003.176-.028.275.212.1.243.344.838.374.899.03.061.05.132.01.213-.04.081-.061.132-.121.203-.061.071-.128.158-.183.213-.061.061-.125.128-.054.25.071.121.315.52.676.841.465.412.857.541.978.601.121.061.192.051.264-.03.071-.081.305-.355.387-.477.082-.121.163-.101.275-.061.111.04.706.334.827.395.121.061.203.091.233.142.031.051.031.294-.112.699z"/></svg>
            Falar com a Loja
        </button>

      </main>
    </div>
  );
};
