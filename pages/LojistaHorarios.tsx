
import React from 'react';

export const LojistaHorarios = () => {
  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Horários de Funcionamento</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie quando sua loja aceita pedidos na plataforma.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Loja Aberta</span>
              <div className="w-12 h-6 bg-emerald-600 rounded-full relative flex items-center px-1 shadow-inner">
                 <div className="w-4 h-4 bg-white rounded-full shadow-md translate-x-6" />
              </div>
           </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 bg-[#fafbfc] flex justify-between items-center">
                <h3 className="font-black text-gray-800 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="text-emerald-600 text-xl">📅</span> Programação Semanal
                </h3>
                <button className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                  Repetir para todos os dias
                </button>
             </div>
             
             <div className="p-10 space-y-10">
                {['Segunda-feira', 'Terça-feira'].map(dia => (
                  <div key={dia} className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <h4 className="font-black text-gray-800 text-lg w-40">{dia}</h4>
                          <div className="w-12 h-6 bg-emerald-600 rounded-full relative flex items-center px-1 shadow-inner">
                             <div className="w-4 h-4 bg-white rounded-full shadow-md translate-x-6" />
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Início</span>
                           <div className="relative">
                             <input type="text" value="08:00 AM" className="bg-[#f8fafc] border border-gray-100 rounded-xl py-3 px-6 text-xs font-black text-gray-700 outline-none w-32" />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">🕒</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fim</span>
                           <div className="relative">
                             <input type="text" value="02:00 PM" className="bg-[#f8fafc] border border-gray-100 rounded-xl py-3 px-6 text-xs font-black text-gray-700 outline-none w-32" />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">🕒</span>
                           </div>
                        </div>
                        <button className="text-red-400 hover:text-red-600 transition-colors p-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Início</span>
                           <div className="relative">
                             <input type="text" value="06:00 PM" className="bg-[#f8fafc] border border-gray-100 rounded-xl py-3 px-6 text-xs font-black text-gray-700 outline-none w-32" />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">🕒</span>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fim</span>
                           <div className="relative">
                             <input type="text" value="11:00 PM" className="bg-[#f8fafc] border border-gray-100 rounded-xl py-3 px-6 text-xs font-black text-gray-700 outline-none w-32" />
                             <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">🕒</span>
                           </div>
                        </div>
                        <button className="text-red-400 hover:text-red-600 transition-colors p-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>

                      <button className="text-emerald-600 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:underline">
                         <span className="text-lg">+</span> Adicionar Intervalo
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between py-6 border-t border-gray-50">
                   <div className="flex items-center gap-4">
                      <h4 className="font-black text-gray-400 text-lg w-40">Quarta-feira</h4>
                      <div className="w-12 h-6 bg-gray-200 rounded-full relative flex items-center px-1 shadow-inner">
                         <div className="w-4 h-4 bg-white rounded-full shadow-md translate-x-0" />
                      </div>
                   </div>
                   <p className="text-[10px] font-bold text-gray-400 italic">Fechado para o público</p>
                </div>

                <div className="pt-8 border-t border-gray-50 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                   <p>Exibindo Quinta-feira até Domingo...</p>
                   <button className="text-emerald-600 hover:underline">Expandir todos os dias</button>
                </div>
             </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 bg-[#fafbfc]">
                <h3 className="font-black text-gray-800 flex items-center gap-3 uppercase tracking-tighter">
                  <span className="text-orange-500 text-xl">🗓️</span> Feriados e Datas Especiais
                </h3>
             </div>
             <div className="p-10 space-y-8">
                <div className="flex gap-4">
                   <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Data</label>
                      <input type="date" className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 text-xs font-bold outline-none" />
                   </div>
                   <div className="flex-[2] space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Descrição/Motivo</label>
                      <input type="text" placeholder="Ex: Feriado de Carnaval" className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 text-xs font-bold outline-none" />
                   </div>
                   <button className="self-end bg-[#2d7a3a] text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg hover:scale-105 transition-all">
                      +
                   </button>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center p-6 bg-[#fafbfc] rounded-2xl border border-gray-50 group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-6">
                         <div className="bg-white p-3 rounded-xl border border-gray-100 text-center w-14 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase block leading-none">DEZ</span>
                            <span className="text-2xl font-black text-gray-800 block mt-1 leading-none">25</span>
                         </div>
                         <div>
                            <p className="font-black text-gray-800">Natal</p>
                            <p className="text-[9px] font-black text-red-400 uppercase tracking-widest">Fechado o dia todo</p>
                         </div>
                      </div>
                      <button className="text-gray-300 hover:text-red-500 transition-colors p-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                   </div>

                   <div className="flex justify-between items-center p-6 bg-[#fafbfc] rounded-2xl border border-gray-50 group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-6">
                         <div className="bg-white p-3 rounded-xl border border-gray-100 text-center w-14 shadow-sm">
                            <span className="text-[10px] font-black text-gray-400 uppercase block leading-none">JAN</span>
                            <span className="text-2xl font-black text-gray-800 block mt-1 leading-none">01</span>
                         </div>
                         <div>
                            <p className="font-black text-gray-800">Ano Novo</p>
                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Horário Especial: 18:00 - 23:00</p>
                         </div>
                      </div>
                      <button className="text-gray-300 hover:text-red-500 transition-colors p-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                   </div>
                </div>
             </div>
          </section>
        </div>

        <div className="space-y-8">
           <div className="bg-[#eff7f1] p-10 rounded-[2.5rem] border border-emerald-100">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center text-lg font-black mb-6 shadow-lg shadow-emerald-500/20">i</div>
              <h3 className="text-xl font-black text-emerald-900 tracking-tight mb-4">Dica de Gestão</h3>
              <p className="text-emerald-700/80 font-medium leading-relaxed">Configurar horários de almoço e jantar separadamente ajuda a gerenciar melhor as expectativas dos seus clientes e a disponibilidade da sua equipe de cozinha.</p>
           </div>

           <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-between h-fit sticky top-32">
              <div>
                 <h3 className="text-xl font-black text-gray-800 mb-8 tracking-tighter">Preview Atual</h3>
                 <div className="bg-[#f8fafc] rounded-3xl p-6 border border-gray-50 mb-8">
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Atual</span>
                       <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Aberto Agora</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-bold">Segunda-feira</span>
                          <span className="font-black text-gray-700">08:00 - 14:00, 18:00 - 23:00</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-400 font-bold">Terça-feira</span>
                          <span className="font-black text-gray-700">11:00 - 23:00</span>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <button className="w-full bg-[#2d7a3a] text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#256631] transition-all flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    Salvar Alterações
                 </button>
                 <button className="w-full text-center text-xs font-bold text-emerald-600 hover:underline">Ver todos os horários</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
