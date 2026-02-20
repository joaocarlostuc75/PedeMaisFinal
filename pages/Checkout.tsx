
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Entrega } from '../types';

export const Checkout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lojas, cart, cartLojaId, produtos, updateCartQuantity, clearCart, addEntrega } = useStore();
  const loja = lojas.find(l => l.slug === slug) || lojas[0];

  const [tipo, setTipo] = useState<'entrega' | 'retirada'>('entrega');
  const [pagamento, setPagamento] = useState('PIX');
  const [troco, setTroco] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  
  // Filtra itens do carrinho apenas da loja atual
  const currentCartItems = cartLojaId === loja.id ? cart : [];

  // Hidrata os itens com detalhes do produto
  const items = useMemo(() => {
      return currentCartItems.map(item => {
          const produto = produtos.find(p => p.id === item.produtoId);
          return produto ? { ...produto, qtd: item.qtd } : null;
      }).filter(item => item !== null) as (typeof produtos[0] & { qtd: number })[];
  }, [currentCartItems, produtos]);

  const subtotal = items.reduce((acc, curr) => acc + (curr.preco * curr.qtd), 0);
  const taxa = tipo === 'entrega' ? (loja.taxaEntrega || 5.50) : 0;
  const total = subtotal + taxa;

  // Cálculos de Troco
  const valorEntregue = troco ? parseFloat(troco.replace(',', '.')) : 0;
  const valorTroco = valorEntregue - total;

  const updateQtd = (id: string, delta: number) => {
    updateCartQuantity(id, delta);
  };

  const removeItem = (id: string) => {
    updateCartQuantity(id, -1000); // Força remoção zerando quantidade
  };

  const finalizarPedido = () => {
    if (items.length === 0) return alert('Seu carrinho está vazio.');
    if (!nome) return alert('Por favor, informe seu nome.');
    if (!telefone) return alert('Por favor, informe seu telefone/whatsapp.');
    if (tipo === 'entrega' && !endereco) return alert('Por favor, informe o endereço.');

    // Lógica de Pagamento e Troco
    let detalhePagamento = pagamento;
    if (pagamento === 'Dinheiro') {
        if (troco) {
            if (isNaN(valorEntregue) || valorEntregue < total) {
                return alert('O valor para troco deve ser maior que o total do pedido.');
            }
            detalhePagamento = `Dinheiro (Troco para ${formatCurrency(valorEntregue)})`;
        } else {
            detalhePagamento = 'Dinheiro (Sem troco)';
        }
    }

    // 1. Criar o objeto do Pedido
    const novoPedidoId = Math.random().toString(36).substr(2, 9);
    const novoPedido: Entrega = {
        id: `ped-${novoPedidoId}`,
        lojaId: loja.id,
        clienteNome: nome,
        clienteTelefone: telefone, // Salva o telefone para CRM
        endereco: tipo === 'entrega' ? endereco : 'Retirada na Loja',
        tipoEntrega: tipo,
        metodoPagamento: detalhePagamento,
        valor: total,
        status: 'pendente',
        data: new Date().toISOString(),
        itens: items.map(i => ({
            qtd: i.qtd,
            nome: i.nome,
            preco: i.preco,
            detalhe: i.descricao // Usando descrição como detalhe base
        }))
    };

    // 2. Confirmar no Sistema
    addEntrega(novoPedido);
    
    // 3. Limpar Carrinho
    clearCart();

    // 4. Montar mensagem do WhatsApp
    let msg = `*NOVO PEDIDO #${novoPedidoId.toUpperCase()}*\n`;
    msg += `--------------------------------\n`;
    msg += `👤 *Cliente:* ${nome}\n`;
    msg += `📱 *Tel:* ${telefone}\n`;
    msg += `🚚 *Tipo:* ${tipo.toUpperCase()}\n`;
    if (tipo === 'entrega') msg += `📍 *Endereço:* ${endereco}\n`;
    msg += `💰 *Pagamento:* ${detalhePagamento}\n`;
    msg += `--------------------------------\n`;
    msg += `*ITENS DO PEDIDO:*\n`;
    items.forEach(i => {
      msg += `${i.qtd}x ${i.nome} (${formatCurrency(i.preco)})\n`;
    });
    msg += `--------------------------------\n`;
    msg += `Subtotal: ${formatCurrency(subtotal)}\n`;
    msg += `Taxa de Entrega: ${formatCurrency(taxa)}\n`;
    msg += `*TOTAL: ${formatCurrency(total)}*\n`;
    
    if (pagamento === 'Dinheiro' && valorTroco > 0) {
        msg += `*Troco: ${formatCurrency(valorTroco)}*\n`;
    }

    msg += `\n🔗 *Acompanhe seu pedido:* ${window.location.origin}/#/rastreio/${novoPedido.id}`;
    
    // Adiciona nota sobre pagamento se não for dinheiro
    if (pagamento !== 'Dinheiro') {
        msg += `\n⚠️ *Aguardando dados para pagamento via ${pagamento}*\n`;
    }
    
    const encoded = encodeURIComponent(msg);
    // Abre WhatsApp
    window.open(`https://wa.me/${loja.whatsapp}?text=${encoded}`, '_blank');
    
    // 5. Redirecionar para tela de rastreamento
    navigate(`/rastreio/${novoPedido.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f1f4f9] font-sans pb-20">
      <nav className="bg-white px-8 py-4 border-b border-gray-100 sticky top-0 z-50 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-xs font-black text-gray-400 hover:text-emerald-600 transition-all uppercase tracking-widest group">
           <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
           Voltar para a loja
        </button>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xl">🥗</div>
           <span className="font-black text-gray-800 tracking-tighter">{loja.nome}</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Coluna Itens */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Seu Carrinho <span className="text-gray-400 font-bold">({items.reduce((acc, i) => acc + i.qtd, 0)} itens)</span></h2>
            
            <div className="space-y-4">
              {items.length === 0 ? (
                  <div className="p-10 bg-white rounded-[2rem] text-center border border-gray-100">
                      <p className="text-gray-400 font-bold">Seu carrinho está vazio.</p>
                      <button onClick={() => navigate(-1)} className="mt-4 text-emerald-600 font-black uppercase text-xs hover:underline">Voltar e Comprar</button>
                  </div>
              ) : (
                  items.map(item => (
                    <div key={item.id} className="bg-white rounded-[2rem] p-4 sm:p-6 shadow-sm border border-gray-50 flex flex-col sm:flex-row gap-4 sm:gap-6 group hover:shadow-md transition-shadow">
                    <div className="w-full sm:w-24 h-40 sm:h-24 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                        {item.imagem ? (
                            <img src={item.imagem} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">📷</div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="font-black text-gray-800 leading-tight">{item.nome}</h4>
                                <p className="text-[11px] text-gray-400 font-bold mt-1 line-clamp-1">{item.descricao}</p>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                                <button onClick={() => updateQtd(item.id, -1)} className="w-8 h-8 flex items-center justify-center font-black text-gray-400 hover:text-emerald-600 transition-colors">-</button>
                                <span className="w-8 text-center font-black text-xs text-gray-700">{item.qtd}</span>
                                <button onClick={() => updateQtd(item.id, 1)} className="w-8 h-8 flex items-center justify-center font-black text-gray-400 hover:text-emerald-600 transition-colors">+</button>
                            </div>
                            <span className="font-black text-lg text-gray-900">{formatCurrency(item.preco * item.qtd)}</span>
                        </div>
                    </div>
                    </div>
                ))
              )}
            </div>
          </div>

          {/* Coluna Dados e Finalização */}
          <div className="lg:col-span-5 space-y-8">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50">
               <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Entrega</h3>
               
               <div className="bg-[#f8fafc] rounded-2xl p-1.5 flex gap-2 mb-8 border border-gray-100">
                  <button onClick={() => setTipo('entrega')} className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${tipo === 'entrega' ? 'bg-white shadow-md text-emerald-600' : 'text-gray-400'}`}>
                     <span>🛵</span> Entrega
                  </button>
                  <button onClick={() => setTipo('retirada')} className={`flex-1 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${tipo === 'retirada' ? 'bg-white shadow-md text-emerald-600' : 'text-gray-400'}`}>
                     <span>🏪</span> Retirada
                  </button>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Seu Nome</label>
                     <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: João Silva" className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp / Telefone</label>
                     <input 
                        type="text" 
                        value={telefone} 
                        onChange={e => setTelefone(e.target.value)} 
                        placeholder="(00) 00000-0000" 
                        className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" 
                     />
                  </div>

                  {tipo === 'entrega' && (
                    <>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Endereço Completo</label>
                         <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua das Flores, 123 - Centro" className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Complemento / Ref.</label>
                         <input type="text" placeholder="Apto 101, próx. ao mercado" className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-xs font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Forma de Pagamento</label>
                     <select value={pagamento} onChange={e => { setPagamento(e.target.value); setTroco(''); }} className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-xs font-bold outline-none appearance-none transition-all cursor-pointer">
                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                        <option value="PIX">PIX</option>
                        <option value="Dinheiro">Dinheiro</option>
                     </select>
                     
                     {/* Campo de Troco Condicional */}
                     {pagamento === 'Dinheiro' && (
                        <div className="mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Troco para quanto?</label>
                           <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                              <input 
                                 type="number" 
                                 value={troco}
                                 onChange={e => setTroco(e.target.value)}
                                 className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                                 placeholder="0,00"
                              />
                           </div>
                           <p className="text-[10px] text-gray-400 font-bold mt-2 text-right">Deixe vazio se for valor exato</p>
                        </div>
                     )}

                     {(pagamento === 'PIX' || pagamento === 'Cartão de Crédito') && (
                        <p className="text-[10px] font-bold text-gray-500 mt-2 flex items-center gap-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                           <span className="text-emerald-500 text-lg">ℹ️</span> 
                           <span>O lojista enviará os dados para pagamento ({pagamento}) pelo WhatsApp após receber o pedido.</span>
                        </p>
                     )}
                  </div>
               </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-50">
               <h3 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Resumo do Pedido</h3>
               
               <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
                     <span>Subtotal</span>
                     <span className="text-gray-800">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-400 uppercase tracking-widest">
                     <span>Taxa de Entrega</span>
                     <span className="text-gray-800">{formatCurrency(taxa)}</span>
                  </div>
                  <div className="h-[1px] bg-gray-50 border-t border-dashed border-gray-200 mt-2" />
                  <div className="flex justify-between items-end pt-2">
                     <span className="text-2xl font-black text-gray-900 tracking-tighter">Total</span>
                     <span className="text-3xl font-black text-[#2d7a3a] tracking-tighter">{formatCurrency(total)}</span>
                  </div>

                  {/* Exibição do Troco no Resumo */}
                  {pagamento === 'Dinheiro' && valorEntregue > 0 && (
                      <div className={`mt-4 p-4 rounded-xl border flex justify-between items-center animate-fade-in ${valorTroco >= 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                          <div>
                              <p className={`text-[10px] font-black uppercase tracking-widest ${valorTroco >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                  {valorTroco >= 0 ? 'Troco a receber' : 'Valor insuficiente'}
                              </p>
                              {valorTroco >= 0 && <p className="text-[10px] font-bold text-emerald-500/80">Levar para {formatCurrency(valorEntregue)}</p>}
                          </div>
                          <span className={`text-xl font-black ${valorTroco >= 0 ? 'text-emerald-700' : 'text-red-500'}`}>
                              {valorTroco >= 0 ? formatCurrency(valorTroco) : 'Faltam ' + formatCurrency(Math.abs(valorTroco))}
                          </span>
                      </div>
                  )}
               </div>

               <button 
                  onClick={finalizarPedido}
                  disabled={items.length === 0}
                  className="w-full bg-[#2d7a3a] text-white py-6 rounded-3xl font-black text-lg tracking-tight flex items-center justify-center gap-4 shadow-2xl shadow-emerald-900/10 hover:bg-[#256631] transition-all transform hover:-translate-y-1 active:scale-95 group disabled:bg-gray-300 disabled:shadow-none"
               >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.047-.057-.262-.069-.517-.149-1.512-.567-1.179-.494-1.925-1.635-1.984-1.712-.058-.077-.471-.625-.471-1.202 0-.577.301-.86.41-.977.108-.117.234-.146.312-.146.079 0 .158.001.228.004.075.003.176-.028.275.212.1.243.344.838.374.899.03.061.05.132.01.213-.04.081-.061.132-.121.203-.061.071-.128.158-.183.213-.061.061-.125.128-.054.25.071.121.315.52.676.841.465.412.857.541.978.601.121.061.192.051.264-.03.071-.081.305-.355.387-.477.082-.121.163-.101.275-.061.111.04.706.334.827.395.121.061.203.091.233.142.031.051.031.294-.112.699z"/></svg>
                  Confirmar e Acompanhar
               </button>
               <p className="text-[10px] text-gray-400 font-bold text-center mt-6 px-4">Ao clicar, você será redirecionado para a tela de rastreio e abriremos o WhatsApp.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
