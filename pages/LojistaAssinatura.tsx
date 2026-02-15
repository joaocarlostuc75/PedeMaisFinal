
import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { useNavigate } from 'react-router-dom';

export const LojistaAssinatura = () => {
  const navigate = useNavigate();
  const { planos, lojas, updatePlanoLoja, addNotification, user } = useStore();
  
  // Identifica a loja atual
  const currentLojaId = user?.lojaId || 'l1';
  const loja = lojas.find(l => l.id === currentLojaId) || lojas[0];
  const meuPlano = planos.find(p => p.id === loja.planoId);

  const handleChangePlan = (planoId: string, nomePlano: string) => {
      if (window.confirm(`Deseja alterar seu plano para ${nomePlano}? O novo valor será cobrado na próxima fatura.`)) {
          updatePlanoLoja(loja.id, planoId);
          addNotification('success', `Plano alterado para ${nomePlano} com sucesso!`);
      }
  };

  const handleOpenSupport = () => {
      navigate('/admin/suporte', { state: { openNew: true } });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-in font-sans pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Minha Assinatura</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie seu plano e visualize os benefícios ativos.</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-6 py-2 rounded-full flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
           <span className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.1em]">Plano {meuPlano?.nome}</span>
        </div>
      </header>

      {/* Detalhes do Plano */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between relative overflow-hidden">
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
                    <span className="text-gray-800">850 / {meuPlano?.limitePedidos}</span>
                  </div>
                  <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
              </div>

              <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span>Entregadores ativos</span>
                    <span className="text-gray-800">4 / {meuPlano?.limiteEntregadores}</span>
                  </div>
                  <div className="w-full bg-gray-50 h-3 rounded-full overflow-hidden border border-gray-100">
                    <div className="bg-[#1e293b] h-full rounded-full" style={{ width: '40%' }} />
                  </div>
              </div>
            </div>
        </div>

        <div className="mt-8 md:mt-0 text-right">
            <h4 className="text-4xl font-black text-gray-900 tracking-tighter">{formatCurrency(meuPlano?.preco || 0)}<span className="text-sm font-medium text-gray-400">/mês</span></h4>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Renovação Automática</p>
        </div>
      </section>

      {/* Planos Disponíveis */}
      <section className="space-y-10">
         <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Planos Disponíveis</h2>
            <p className="text-gray-500 font-medium mt-2">Escolha o plano que melhor atende às necessidades do seu negócio.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-8">
            {planos.filter(p => !p.privado).map(p => {
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
                       <span className="text-emerald-500">✓</span> {p.limitePedidos >= 99999 ? 'Pedidos ilimitados' : `Até ${p.limitePedidos} pedidos/mês`}
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-500">
                       <span className="text-emerald-500">✓</span> {p.limiteEntregadores >= 999 ? 'Entregadores ilimitados' : `${p.limiteEntregadores} entregadores`}
                    </li>
                    {p.recursos.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                         <span className="text-emerald-500">✓</span> {r}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => !isCurrent && handleChangePlan(p.id, p.nome)}
                    disabled={isCurrent}
                    className={`w-full py-5 rounded-[1.5rem] font-black text-xs tracking-widest transition-all ${isCurrent ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-[#112644] text-white shadow-xl hover:bg-emerald-600 hover:scale-[1.02] active:scale-95'}`}
                  >
                    {isCurrent ? 'ATIVO' : (p.preco < (meuPlano?.preco || 0) ? 'DOWNGRADE' : 'UPGRADE')}
                  </button>
                </div>
              );
            })}
         </div>
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
        <button 
            onClick={handleOpenSupport}
            className="bg-[#112644] text-white px-10 py-5 rounded-[1.5rem] font-black text-sm tracking-widest shadow-xl shadow-blue-900/10 hover:bg-emerald-600 transition-all"
        >
          FALAR COM SUPORTE
        </button>
      </div>
    </div>
  );
};
