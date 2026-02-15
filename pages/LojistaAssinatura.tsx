
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Fatura, MeioPagamento } from '../types';

export const LojistaAssinatura = () => {
  const { faturas, meiosPagamento, planos, lojas, addMeioPagamento, updateMeioPagamento, deleteMeioPagamento, addNotification } = useStore();
  const loja = lojas[0];
  const meuPlano = planos.find(p => p.id === loja.planoId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Partial<MeioPagamento> | null>(null);

  const handleOpenModal = (payment?: MeioPagamento) => {
    if (payment) {
        setEditingPayment(payment);
    } else {
        setEditingPayment({ tipo: 'Cartão', detalhe: '', extra: '' });
    }
    setIsModalOpen(true);
  };

  const handleSavePayment = () => {
      if (!editingPayment?.detalhe) {
          addNotification('error', 'O detalhe do pagamento é obrigatório.');
          return;
      }

      if (editingPayment.id) {
          updateMeioPagamento(editingPayment.id, editingPayment);
          addNotification('success', 'Meio de pagamento atualizado.');
      } else {
          addMeioPagamento({
              id: Math.random().toString(36).substr(2, 9),
              tipo: editingPayment.tipo || 'Cartão',
              detalhe: editingPayment.detalhe,
              extra: editingPayment.extra || ''
          } as MeioPagamento);
          addNotification('success', 'Novo meio de pagamento adicionado.');
      }
      setIsModalOpen(false);
      setEditingPayment(null);
  };

  const handleDeletePayment = (id: string) => {
      if (window.confirm('Tem certeza que deseja remover este método de pagamento?')) {
          deleteMeioPagamento(id);
          addNotification('info', 'Método de pagamento removido.');
      }
  };

  const imprimirReciboAssinatura = (fatura: Fatura) => {
    const janela = window.open('', '', 'width=800,height=600');
    if (janela) {
        janela.document.write(`
            <html>
            <head>
                <title>Recibo #${fatura.id}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #059669; padding-bottom: 20px; margin-bottom: 40px; }
                    .title { font-size: 24px; font-weight: bold; color: #059669; }
                    .info { margin-bottom: 30px; }
                    .info p { margin: 5px 0; }
                    .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                    .table th { background: #f0fdf4; text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
                    .table td { padding: 12px; border-bottom: 1px solid #eee; }
                    .total { text-align: right; font-size: 20px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 60px; font-size: 12px; color: #999; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div>
                        <div class="title">Pede Mais</div>
                        <div style="font-size: 12px; margin-top: 5px;">Plataforma de Delivery SaaS</div>
                    </div>
                    <div style="text-align: right;">
                        <strong>RECIBO DE PAGAMENTO</strong><br/>
                        #${fatura.id.toUpperCase()}
                    </div>
                </div>

                <div class="info">
                    <strong>Pagador:</strong> ${loja.nome}<br/>
                    <strong>Referência:</strong> ${fatura.mesReferencia}<br/>
                    <strong>Status:</strong> ${fatura.status.toUpperCase()}
                </div>

                <table class="table">
                    <thead>
                        <tr><th>Descrição</th><th>Valor</th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Assinatura Mensal - Plano ${meuPlano?.nome || 'Standard'}</td>
                            <td>${formatCurrency(fatura.valor)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="total">
                    Total Pago: ${formatCurrency(fatura.valor)}
                </div>

                <div class="footer">
                    Este documento comprova o pagamento da mensalidade de uso da plataforma Pede Mais.<br/>
                    Obrigado pela parceria.
                </div>
                <script>window.print();</script>
            </body>
            </html>
        `);
        janela.document.close();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in font-sans pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Minha Assinatura</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie seu plano e visualize seu histórico de pagamentos.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-6 py-2 rounded-full flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.1em]">Plano {meuPlano?.nome}</span>
        </div>
      </header>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Detalhes do Plano */}
        <section className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between relative overflow-hidden">
          <div className="space-y-8 flex-1">
             <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Detalhes do Plano</h3>
                <p className="text-emerald-500 text-xs font-black uppercase flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Status: Ativo
                </p>
             </div>

             <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Pedidos no mês</span>
                      <span className="text-gray-800">850 / 1.000</span>
                   </div>
                   <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <span>Entregadores ativos</span>
                      <span className="text-gray-800">4 / 10</span>
                   </div>
                   <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                      <div className="bg-[#1e293b] h-full rounded-full" style={{ width: '40%' }} />
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-8 md:mt-0 text-right">
             <h4 className="text-4xl font-black text-gray-900 tracking-tighter">{formatCurrency(meuPlano?.preco || 0)}<span className="text-sm font-medium text-gray-400">/mês</span></h4>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Próxima cobrança: 15/11</p>
          </div>
        </section>

        {/* Métodos de Pagamento */}
        <section className="lg:col-span-4 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
           <h3 className="text-lg font-bold text-gray-800 mb-8">Método de Pagamento</h3>
           <div className="space-y-4">
              {meiosPagamento.map(m => (
                <div key={m.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:bg-white hover:border-emerald-500 transition-all cursor-pointer">
                   <div className="flex items-center gap-4">
                      <span className="text-2xl">{m.tipo === 'Cartão' ? '💳' : '📱'}</span>
                      <div>
                         <p className="text-xs font-black text-gray-800">{m.detalhe}</p>
                         <p className="text-[10px] font-medium text-gray-400">{m.extra}</p>
                      </div>
                   </div>
                   <div className="flex gap-2">
                        <button onClick={() => handleOpenModal(m)} className="text-[9px] font-black text-gray-400 hover:text-emerald-600 uppercase transition-all">Editar</button>
                        <button onClick={() => handleDeletePayment(m.id)} className="text-[9px] font-black text-gray-400 hover:text-red-500 uppercase transition-all">Excluir</button>
                   </div>
                </div>
              ))}
              <button 
                onClick={() => handleOpenModal()}
                className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all mt-4"
              >
                + Adicionar novo método
              </button>
           </div>
        </section>
      </div>

      {/* Planos Disponíveis */}
      <section className="space-y-10">
         <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Planos Disponíveis</h2>
            <p className="text-gray-500 font-medium mt-2">Escolha o plano que melhor atende às necessidades do seu negócio.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-8">
            {planos.map(p => {
              const isCurrent = p.id === loja.planoId;
              return (
                <div key={p.id} className={`relative p-10 rounded-[3rem] border-4 flex flex-col transition-all group ${isCurrent ? 'bg-white border-emerald-500 shadow-2xl scale-105' : 'bg-gray-50/50 border-transparent hover:bg-white hover:border-gray-200'}`}>
                  {isCurrent && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">Seu Plano</div>
                  )}
                  
                  <div className="mb-10">
                    <h4 className="text-xl font-bold text-gray-800 mb-4">{p.nome}</h4>
                    <h5 className="text-4xl font-black text-gray-900 tracking-tighter">
                       {p.nome === 'Enterprise' ? 'Personalizado' : formatCurrency(p.preco)}
                       {p.nome !== 'Enterprise' && <span className="text-xs font-medium text-gray-400 ml-1">/mês</span>}
                    </h5>
                  </div>

                  <ul className="space-y-5 mb-12 flex-1">
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                       <span className="text-emerald-500">✓</span> {p.limitePedidos === 99999 ? 'Pedidos ilimitados' : `${p.limitePedidos} pedidos/mês`}
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                       <span className="text-emerald-500">✓</span> {p.limiteEntregadores === 999 ? 'Entregadores ilimitados' : `${p.limiteEntregadores} entregadores`}
                    </li>
                    {p.recursos.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                         <span className="text-emerald-500">✓</span> {r}
                      </li>
                    ))}
                  </ul>

                  <button className={`w-full py-5 rounded-[1.5rem] font-black text-xs tracking-widest transition-all ${isCurrent ? 'bg-gray-100 text-gray-400' : 'bg-[#112644] text-white shadow-xl hover:bg-emerald-600'}`}>
                    {isCurrent ? 'ATIVO' : (p.preco < meuPlano!.preco ? 'DOWNGRADE' : 'UPGRADE')}
                  </button>
                </div>
              );
            })}
         </div>
      </section>

      {/* Histórico de Cobrança */}
      <section className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">Histórico de Cobrança</h3>
        </div>
        <table className="w-full text-left">
          <thead className="text-[10px] font-black uppercase text-gray-400 tracking-widest border-b border-gray-50">
            <tr>
              <th className="p-8">Mês de Referência</th>
              <th className="p-8">Valor</th>
              <th className="p-8">Status do Pagamento</th>
              <th className="p-8 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {faturas.map(f => (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-8 font-bold text-gray-700 text-sm">{f.mesReferencia}</td>
                <td className="p-8 font-bold text-gray-800">{formatCurrency(f.valor)}</td>
                <td className="p-8">
                   <span className="bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{f.status}</span>
                </td>
                <td className="p-8 text-right">
                   <button 
                      onClick={() => imprimirReciboAssinatura(f)}
                      className="text-[10px] font-black text-gray-700 uppercase tracking-widest flex items-center gap-2 ml-auto hover:text-emerald-600 transition-colors"
                   >
                      📥 Recibo
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="w-full py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:bg-gray-50 transition-all">Ver todo o histórico</button>
      </section>

      {/* Help Card */}
      <div className="bg-[#eff7f1] p-10 rounded-[3rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-8">
           <div className="w-16 h-16 bg-emerald-600 text-white rounded-[1.5rem] flex items-center justify-center text-3xl shadow-xl shadow-emerald-600/20">?</div>
           <div>
              <h3 className="text-xl font-bold text-emerald-900 tracking-tight">Precisa de ajuda com sua assinatura?</h3>
              <p className="text-emerald-700/80 font-medium">Nossa equipe de suporte está pronta para te auxiliar com planos personalizados.</p>
           </div>
        </div>
        <button className="bg-[#112644] text-white px-10 py-5 rounded-[1.5rem] font-black text-sm tracking-widest shadow-xl shadow-blue-900/10 hover:bg-emerald-600 transition-all">
          FALAR COM SUPORTE
        </button>
      </div>

      {/* Modal de Edição de Pagamento */}
      {isModalOpen && editingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900">{editingPayment.id ? 'Editar Pagamento' : 'Novo Método'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400 hover:bg-gray-200">✕</button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Tipo</label>
                        <select 
                            value={editingPayment.tipo}
                            onChange={e => setEditingPayment({...editingPayment, tipo: e.target.value as any})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-gray-800 outline-none"
                        >
                            <option value="Cartão">Cartão de Crédito</option>
                            <option value="PIX">PIX</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Detalhe (Ex: Final 4242 ou Chave PIX)</label>
                        <input 
                            type="text"
                            value={editingPayment.detalhe}
                            onChange={e => setEditingPayment({...editingPayment, detalhe: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-gray-800 outline-none"
                            placeholder={editingPayment.tipo === 'Cartão' ? 'Mastercard Final 1234' : 'sua@chave.pix'}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Extra (Opcional - Ex: Validade)</label>
                        <input 
                            type="text"
                            value={editingPayment.extra}
                            onChange={e => setEditingPayment({...editingPayment, extra: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold text-gray-800 outline-none"
                            placeholder="Expira em 12/30"
                        />
                    </div>
                    
                    <button onClick={handleSavePayment} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-black uppercase text-xs shadow-lg hover:bg-emerald-500 transition-all mt-4">
                        Salvar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
