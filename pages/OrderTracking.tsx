
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';

export const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { entregas, lojas, entregadores, atualizarStatusPedido, addNotification, myOrderIds } = useStore();
  const [now, setNow] = useState(new Date());

  // Estado local para animação de entrada
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
      setMounted(true);
  }, []);

  useEffect(() => {
    // Atualiza o componente a cada 30s para atualizar tempos relativos
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // SEGURANÇA: Verifica se o ID do pedido pertence ao usuário atual (está na lista myOrderIds)
  // Se não estiver, retorna null para simular "não encontrado" e bloquear acesso
  const isMyOrder = id && myOrderIds.includes(id);
  const pedido = isMyOrder ? entregas.find(e => e.id === id) : null;
  
  const loja = pedido ? lojas.find(l => l.id === pedido.lojaId) : null;
  const entregador = pedido?.entregadorId ? entregadores.find(e => e.id === pedido.entregadorId) : null;

  if (!pedido || !loja) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-4xl mb-6">🔒</div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">Acesso Negado</h1>
        <p className="text-gray-400 mb-8 max-w-md">Não conseguimos encontrar este pedido ou você não tem permissão para visualizá-lo.</p>
        <button onClick={() => navigate('/')} className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-black">Ir para o Início</button>
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
  const isFinished = pedido.status === 'finalizada';

  // Progresso para a barra horizontal
  const progressPercent = Math.max(0, (currentStepIndex / (steps.length - 1)) * 100);

  const handleConfirmarEntrega = () => {
      // Pergunta de segurança dupla
      if (window.confirm("Você confirma que JÁ RECEBEU este pedido?\n\nEssa ação finalizará o pedido no sistema da loja.")) {
          atualizarStatusPedido(pedido.id, 'finalizada');
          addNotification('success', 'Entrega confirmada! Obrigado e bom apetite! 😋');
      }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pb-32">
      {/* Navbar Compacta e Fixa */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 sticky top-0 z-50 flex justify-between items-center shadow-sm transition-all">
          <button onClick={() => navigate('/meus-pedidos')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="text-center">
              <h1 className="font-black text-gray-900 text-sm leading-tight">{loja.nome}</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pedido #{pedido.id.slice(-4)}</p>
          </div>
          <div className="w-10" /> {/* Espaçador para centralizar o título */}
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-6 space-y-6">
        
        {/* Status Card Principal */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 text-center relative overflow-hidden transition-all duration-500 hover:shadow-md">
            {isCancelled ? (
                <div className="py-8">
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 text-red-500 animate-bounce-in">✕</div>
                    <h2 className="text-2xl font-black text-red-600 tracking-tight">Pedido Cancelado</h2>
                    <p className="text-gray-400 font-medium mt-2">Entre em contato com a loja para mais detalhes.</p>
                </div>
            ) : (
                <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mt-32 pointer-events-none" />
                    
                    <div className="relative z-10">
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 border-[6px] border-white shadow-xl shadow-emerald-100 animate-bounce-in transition-transform duration-700 hover:scale-105">
                            {steps[currentStepIndex]?.icon || '✅'}
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2 transition-all duration-300">
                            {steps[currentStepIndex]?.label || 'Processando'}
                        </h2>
                        <p className="text-sm font-medium text-gray-400 animate-pulse">
                            {steps[currentStepIndex]?.desc}
                        </p>
                    </div>

                    {/* Barra de Progresso Horizontal */}
                    <div className="mt-10 bg-gray-100 h-2 rounded-full overflow-hidden relative">
                        <div 
                            className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-[1500ms] ease-in-out" 
                            style={{ width: mounted ? `${progressPercent}%` : '0%' }} 
                        />
                    </div>
                    <div className="flex justify-between mt-3 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                        <span>Recebido</span>
                        <span>Entregue</span>
                    </div>
                </>
            )}
        </div>

        {/* Timeline Detalhada (No corpo da página) */}
        {!isCancelled && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="font-black text-gray-900 text-lg mb-8 flex items-center gap-2">
                    ⏱️ Linha do Tempo
                </h3>
                {/* Linha vertical de fundo */}
                <div className="relative pl-4 space-y-8">
                    <div className="absolute left-[19px] top-2 bottom-6 w-[2px] bg-gray-100 z-0" />
                    
                    {/* Linha de progresso vertical colorida */}
                    <div 
                        className="absolute left-[19px] top-2 w-[2px] bg-emerald-500 z-0 transition-all duration-[1500ms] ease-in-out"
                        style={{ height: mounted ? `${Math.min(100, (currentStepIndex / (steps.length - 1)) * 85)}%` : '0%' }}
                    />

                    {steps.map((step, idx) => {
                        const isActive = idx === currentStepIndex;
                        const isCompleted = idx < currentStepIndex;
                        
                        return (
                            <div 
                                key={step.id} 
                                className={`relative z-10 flex items-center gap-5 transition-all duration-700 ease-out ${
                                    idx > currentStepIndex ? 'opacity-40 grayscale' : 'opacity-100'
                                } ${isActive ? 'translate-x-2' : ''}`}
                            >
                                {/* Círculo do Passo */}
                                <div className={`relative z-10 w-8 h-8 rounded-full border-[3px] flex items-center justify-center text-xs font-black transition-all duration-500 ${
                                    isActive 
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 scale-125 ring-4 ring-emerald-50' 
                                        : isCompleted 
                                            ? 'bg-emerald-500 border-emerald-500 text-white scale-100' 
                                            : 'bg-white border-gray-200 text-gray-300 scale-90'
                                }`}>
                                    {isCompleted ? '✓' : (idx + 1)}
                                </div>

                                {/* Texto do Passo */}
                                <div className={`transition-all duration-500 ${isActive ? 'scale-105 origin-left' : ''}`}>
                                    <p className={`text-sm font-bold transition-colors duration-300 ${
                                        isActive ? 'text-emerald-700 text-base' : 'text-gray-800'
                                    }`}>
                                        {step.label}
                                    </p>
                                    {isActive && (
                                        <p className="text-xs text-gray-500 font-medium mt-0.5 animate-fade-in">
                                            {step.desc}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* ... (Resto do componente mantido) ... */}
        {/* Card do Entregador (Aparece apenas quando estiver 'em_transito') */}
        {entregador && pedido.status === 'em_transito' && (
            <div className="bg-gray-900 text-white p-6 rounded-[2rem] shadow-xl flex items-center gap-5 transform transition-all hover:scale-[1.02] animate-bounce-in">
                <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-2xl border-2 border-gray-700 animate-pulse">
                    🛵
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Seu Entregador</p>
                    <h3 className="font-black text-lg leading-none">{entregador.nome}</h3>
                    <div className="flex gap-3 mt-2 text-xs font-bold text-gray-400">
                        <span className="bg-white/10 px-2 py-1 rounded">{entregador.tipoVeiculo}</span>
                        <span className="bg-white/10 px-2 py-1 rounded">{entregador.placa || 'Sem placa'}</span>
                    </div>
                </div>
            </div>
        )}

        {/* Resumo do Pedido */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 text-lg mb-6 flex items-center gap-2">
                📄 Resumo do Pedido
            </h3>
            
            <div className="space-y-4 mb-6">
                {pedido.itens.map((item, i) => (
                    <div key={i} className="flex justify-between items-start text-sm group">
                        <div className="flex gap-3">
                            <span className="font-black text-emerald-600 w-6 flex items-center justify-center bg-emerald-50 rounded h-6 text-xs">{item.qtd}x</span>
                            <div>
                                <p className="font-bold text-gray-700 leading-tight">{item.nome}</p>
                                {item.detalhe && <p className="text-xs text-gray-400 mt-0.5 font-medium">{item.detalhe}</p>}
                            </div>
                        </div>
                        <span className="font-bold text-gray-800">{formatCurrency((item.preco || 0) * item.qtd)}</span>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-dashed border-gray-200 space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span>Taxa de Entrega</span>
                    <span>{formatCurrency(pedido.tipoEntrega === 'retirada' ? 0 : (loja.taxaEntrega || 0))}</span>
                </div>
                <div className="flex justify-between items-end pt-2">
                    <span className="font-black text-gray-900 uppercase tracking-widest text-xs mb-1">Total</span>
                    <span className="font-black text-3xl text-emerald-600 tracking-tighter leading-none">{formatCurrency(pedido.valor)}</span>
                </div>
            </div>
        </div>

        {/* Informações de Entrega */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 grid md:grid-cols-2 gap-6">
             <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-lg text-blue-500 shrink-0">📍</div>
                 <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Entrega</p>
                     <p className="font-bold text-gray-800 text-sm leading-relaxed">{pedido.endereco}</p>
                 </div>
             </div>
             <div className="flex items-start gap-4">
                 <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-lg text-purple-500 shrink-0">💳</div>
                 <div>
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pagamento</p>
                     <p className="font-bold text-gray-800 text-sm">{pedido.metodoPagamento}</p>
                 </div>
             </div>
        </div>

        {/* Botão de Confirmação de Entrega pelo Cliente */}
        {!isCancelled && !isFinished && (
            <button
                onClick={handleConfirmarEntrega}
                className="w-full bg-[#112644] text-white py-5 rounded-2xl font-black shadow-xl shadow-blue-900/10 hover:bg-[#1a3b66] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
                <span className="text-xl">🙌</span>
                JÁ RECEBI O PEDIDO (CONFIRMAR)
            </button>
        )}

        <div className="flex flex-col gap-3">
            <button 
                onClick={() => window.open(`https://wa.me/${loja.whatsapp}`, '_blank')}
                className="w-full bg-[#25D366] text-white py-5 rounded-2xl font-black shadow-lg shadow-green-100 hover:bg-[#20bd5a] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-sm tracking-wide"
            >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.047-.057-.262-.069-.517-.149-1.512-.567-1.179-.494-1.925-1.635-1.984-1.712-.058-.077-.471-.625-.471-1.202 0-.577.301-.86.41-.977.108-.117.234-.146.312-.146.079 0 .158.001.228.004.075.003.176-.028.275.212.1.243.344.838.374.899.03.061.05.132.01.213-.04.081-.061.132-.121.203-.061.071-.128.158-.183.213-.061.061-.125.128-.054.25.071.121.315.52.676.841.465.412.857.541.978.601.121.061.192.051.264-.03.071-.081.305-.355.387-.477.082-.121.163-.101.275-.061.111.04.706.334.827.395.121.061.203.091.233.142.031.051.031.294-.112.699z"/></svg>
                Falar com a Loja
            </button>

            <button 
                onClick={() => navigate(`/loja/${loja.slug}`)}
                className="w-full bg-white border-2 border-emerald-100 text-emerald-600 py-5 rounded-2xl font-black shadow-sm hover:bg-emerald-50 transition-all flex items-center justify-center gap-3 text-sm tracking-wide"
            >
                Voltar para a Loja
            </button>
        </div>

      </main>
    </div>
  );
};
