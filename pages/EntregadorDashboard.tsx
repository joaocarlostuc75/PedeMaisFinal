
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const GANHOS_MOCK = [
  { dia: 'Seg', valor: 85 }, { dia: 'Ter', valor: 120 }, { dia: 'Qua', valor: 45 },
  { dia: 'Qui', valor: 210 }, { dia: 'Sex', valor: 180 }, { dia: 'Sab', valor: 250 }, { dia: 'Dom', valor: 190 },
];

export const EntregadorDashboard = () => {
  const { entregas, saques, aceitarEntrega, solicitarSaque, entregadores } = useStore();
  const entregador = entregadores[0]; // João Motoca demo
  
  const [activeTab, setActiveTab] = useState<'entregas' | 'ganhos' | 'saques' | 'conquistas'>('entregas');
  const [valorSaque, setValorSaque] = useState(0);

  const handleSaque = () => {
    if (valorSaque < 50) return alert('Valor mínimo para saque é R$ 50,00');
    if (valorSaque > entregador.saldo) return alert('Saldo insuficiente');
    
    solicitarSaque({
      id: Math.random().toString(36).substr(2, 9),
      entregadorId: entregador.id,
      valor: valorSaque,
      status: 'processando',
      data: new Date().toISOString()
    });
    alert('Saque solicitado com sucesso!');
  };

  const getRankEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 animate-fade-in">
      {/* Header Gamificado */}
      <header className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] -mr-32 -mt-32 opacity-50" />
        
        <div className="relative z-10">
          <div className="w-24 h-24 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-4xl font-black text-white shadow-xl rotate-3">
            {entregador.nome.charAt(0)}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter border-4 border-white">
            {entregador.nivel}
          </div>
        </div>

        <div className="flex-1 space-y-3 text-center md:text-left relative z-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{entregador.nome}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              {entregador.badges.map(b => (
                <span key={b.id} title={b.descricao} className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-emerald-100 flex items-center gap-1 cursor-help hover:scale-105 transition-transform">
                  {b.icone} {b.nome}
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <span>Nível {entregador.nivel}</span>
              <span>{entregador.xp} / 1000 XP</span>
            </div>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden border border-gray-50 p-0.5">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full rounded-full transition-all duration-1000 relative" style={{ width: `${(entregador.xp / 1000) * 100}%` }}>
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-widest">Faltam {1000 - entregador.xp} XP para subir de categoria</p>
          </div>
        </div>

        <div className="text-center md:text-right bg-gray-900 p-8 rounded-[2rem] shadow-2xl relative z-10 min-w-[200px]">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Disponível para Saque</p>
          <h2 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(entregador.saldo)}</h2>
          <button onClick={() => setActiveTab('saques')} className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">RESGATAR</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
        {(['entregas', 'ganhos', 'saques', 'conquistas'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            {tab === 'conquistas' ? '🏆 Conquistas' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'entregas' && (
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
               <span className="w-2 h-6 bg-emerald-500 rounded-full" />
               PEDIDOS DISPONÍVEIS
            </h3>
            <div className="space-y-4">
              {entregas.filter(e => e.status === 'pendente').map(e => (
                <div key={e.id} className="bg-gray-50 p-6 rounded-3xl border-2 border-transparent hover:border-emerald-500 hover:bg-white transition-all flex justify-between items-center group">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Taxa Líquida</p>
                    <p className="text-2xl font-black text-gray-800 tracking-tighter">{formatCurrency(e.valor)}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded uppercase">+15 XP</span>
                       <span className="text-[10px] text-gray-400 font-bold italic">Distância: 2.4km</span>
                    </div>
                  </div>
                  <button onClick={() => aceitarEntrega(e.id, entregador.id)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs group-hover:scale-105 shadow-lg shadow-emerald-100 transition-all">ACEITAR</button>
                </div>
              ))}
              {entregas.filter(e => e.status === 'pendente').length === 0 && (
                <div className="text-center py-12">
                   <p className="text-gray-400 font-bold uppercase text-xs">Nenhum pedido no momento. Fique atento!</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-gray-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            </div>
            <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative z-10">
               <span className="text-emerald-400">🏆</span> RANKING SEMANAL
            </h3>
            <div className="space-y-4 relative z-10">
              {entregadores.sort((a,b) => b.entregasHoje - a.entregasHoje).slice(0, 5).map((e, idx) => (
                <div key={e.id} className={`flex justify-between items-center p-5 rounded-[1.5rem] transition-all ${e.id === entregador.id ? 'bg-emerald-600 shadow-xl ring-4 ring-white/10 scale-105' : 'bg-white/5 hover:bg-white/10'}`}>
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${idx < 3 ? 'bg-emerald-400 text-gray-900' : 'text-gray-500'}`}>
                      {getRankEmoji(idx)}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-black text-sm">{e.nome} {e.id === entregador.id && '(VOCÊ)'}</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{e.nivel}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg block leading-none">{e.entregasHoje}</span>
                    <span className="text-[9px] uppercase font-black text-white/30 tracking-widest">pedidos</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-[10px] font-black text-white/20 uppercase tracking-widest">O Ranking reseta em: 2 dias 14h</p>
          </section>
        </div>
      )}

      {activeTab === 'conquistas' && (
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm animate-fade-in">
           <div className="text-center mb-12">
             <h3 className="text-3xl font-black text-gray-900 tracking-tighter">SUA GALERIA DE TROFÉUS</h3>
             <p className="text-gray-400 font-medium mt-2">Desbloqueie selos exclusivos e aumente sua reputação.</p>
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="flex flex-col items-center p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 shadow-inner group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💎</div>
                <h4 className="font-black text-gray-800 text-sm mb-1">Entregador Diamante</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase text-center">Concluído</p>
             </div>
             <div className="flex flex-col items-center p-8 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 shadow-inner group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
                <h4 className="font-black text-gray-800 text-sm mb-1">Velocidade Máxima</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase text-center">Concluído</p>
             </div>
             <div className="flex flex-col items-center p-8 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 opacity-60 filter grayscale group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🔥</div>
                <h4 className="font-black text-gray-400 text-sm mb-1 text-center">10 Entregas em 1 Dia</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase text-center">Pendente</p>
             </div>
             <div className="flex flex-col items-center p-8 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 opacity-60 filter grayscale group">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🌟</div>
                <h4 className="font-black text-gray-400 text-sm mb-1 text-center">Nota 5 Estrelas (10x)</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase text-center">Pendente</p>
             </div>
           </div>
        </section>
      )}

      {activeTab === 'saques' && (
        <div className="grid md:grid-cols-2 gap-8">
          <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <h3 className="text-2xl font-black mb-2 tracking-tighter">Solicitar Saque</h3>
            <p className="text-gray-400 mb-8 font-medium">O valor será processado via PIX em até 24h.</p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Valor Disponível: {formatCurrency(entregador.saldo)}</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">R$</span>
                  <input 
                    type="number" step="0.01" value={valorSaque} onChange={e => setValorSaque(Number(e.target.value))}
                    className="w-full bg-gray-50 rounded-2xl p-6 pl-14 font-black text-3xl outline-none focus:ring-4 focus:ring-emerald-500/20 focus:bg-white transition-all"
                    placeholder="0,00"
                  />
                </div>
              </div>
              <button 
                onClick={handleSaque}
                className="w-full bg-emerald-600 text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-emerald-100 hover:bg-emerald-500 hover:-translate-y-1 transition-all active:scale-95"
              >
                SOLICITAR AGORA
              </button>
              <div className="flex justify-between items-center text-[10px] text-gray-400 font-black uppercase tracking-widest px-2">
                 <span>Taxa: Grátis</span>
                 <span>Mínimo: R$ 50,00</span>
              </div>
            </div>
          </section>

          <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <h3 className="text-2xl font-black mb-8 tracking-tighter">Histórico de Resgates</h3>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {saques.filter(s => s.entregadorId === entregador.id).map(s => (
                <div key={s.id} className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-md transition-all">
                  <div>
                    <p className="font-black text-gray-800 text-xl tracking-tighter">{formatCurrency(s.valor)}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatDate(s.data)}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${s.status === 'pago' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {s.status}
                  </span>
                </div>
              ))}
              {saques.filter(s => s.entregadorId === entregador.id).length === 0 && (
                <p className="text-center py-20 text-gray-400 font-bold uppercase text-xs">Nenhum saque solicitado ainda.</p>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'ganhos' && (
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm animate-fade-in">
           <div className="flex justify-between items-end mb-12">
             <div>
               <h3 className="text-2xl font-black tracking-tighter">Relatório de Faturamento</h3>
               <p className="text-gray-400 font-medium">Histórico dos últimos 7 dias de trabalho.</p>
             </div>
             <div className="text-right">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Total na Semana</span>
                <span className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(1120)}</span>
             </div>
           </div>
           <div className="h-96">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={GANHOS_MOCK}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="dia" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem'}} />
                  <Bar dataKey="valor" fill="#10b981" radius={[12, 12, 12, 12]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}
    </div>
  );
};
