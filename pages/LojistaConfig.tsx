
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

export const LojistaConfig = () => {
  const { lojas } = useStore();
  const minhaLoja = lojas[0];
  const [whatsapp, setWhatsapp] = useState(minhaLoja.whatsapp);
  const [nome, setNome] = useState(minhaLoja.nome);

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-900">Configurações</span>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Configurações da Loja</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie as informações principais, horário de funcionamento e identidade visual.</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold text-sm text-gray-700 shadow-sm hover:bg-gray-50 transition-all">Visualizar Loja</button>
           <button className="bg-[#2d7a3a] text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/10 hover:bg-[#256631] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              Salvar Alterações
           </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Identidade e Informações */}
        <div className="lg:col-span-2 space-y-8">
          {/* Identidade Visual */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 bg-[#fafbfc]">
                <h3 className="font-black text-gray-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">🎨</span>
                  Identidade Visual
                </h3>
             </div>
             <div className="p-8 space-y-8">
                <div>
                   <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Banner da Loja (Capa)</label>
                   <div className="w-full h-48 bg-gray-100 rounded-3xl overflow-hidden relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-emerald-500 transition-all">
                      <img src="https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center">
                         <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-emerald-600 mb-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                         </div>
                         <p className="font-black text-xs text-gray-800">Clique para alterar o banner</p>
                         <p className="text-[10px] font-bold text-gray-400 mt-1">Recomendado: 1200x400px</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="relative group">
                      <div className="w-32 h-32 bg-emerald-600 rounded-full border-8 border-white shadow-xl overflow-hidden flex items-center justify-center">
                        <img src={`https://picsum.photos/200/200?random=${minhaLoja.id}`} className="w-full h-full object-cover" />
                      </div>
                      <button className="absolute bottom-1 right-1 w-10 h-10 bg-[#2d7a3a] text-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                      </button>
                   </div>
                   <div className="flex-1">
                      <h4 className="font-black text-gray-800 text-lg">Logo da Marca</h4>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">Este logo aparecerá no seu perfil e nas notas de pedido. Formato quadrado (1:1).</p>
                      <div className="flex gap-4 mt-4">
                         <button className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">Carregar novo</button>
                         <button className="text-red-400 font-black text-xs uppercase tracking-widest hover:underline">Remover</button>
                      </div>
                   </div>
                </div>
             </div>
          </section>

          {/* Informações da Loja */}
          <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-8 border-b border-gray-50 bg-[#fafbfc]">
                <h3 className="font-black text-gray-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">🏪</span>
                  Informações da Loja
                </h3>
             </div>
             <div className="p-8 space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nome da Loja</label>
                   <input 
                      type="text" value={nome} onChange={e => setNome(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                   />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp para Pedidos</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">📱</span>
                         <input 
                            type="text" value="(11) 98765-4321"
                            className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 pl-12 pr-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         />
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold ml-1 italic">Número que receberá as notificações.</p>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Categoria Principal</label>
                      <select className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all">
                         <option>Mercado & Conveniência</option>
                         <option>Restaurante</option>
                         <option>Padaria</option>
                         <option>Farmácia</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Descrição Curta</label>
                   <textarea 
                      className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all h-32 resize-none"
                      placeholder="Fale um pouco sobre sua loja..."
                      defaultValue="Produtos frescos e orgânicos direto do produtor para sua mesa. Entregas rápidas na região central."
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Endereço Completo</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">📍</span>
                      <input 
                        type="text" value="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
                        className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 pl-12 pr-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      />
                   </div>
                </div>
             </div>
          </section>
        </div>

        {/* Coluna Direita: Logística e Horários */}
        <div className="space-y-8">
           {/* Logística */}
           <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-[#fafbfc]">
                <h3 className="font-black text-gray-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">🚚</span>
                  Logística
                </h3>
              </div>
              <div className="p-8 space-y-8">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Taxa de Entrega Fixa</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">R$</span>
                       <input 
                          type="text" value="5.90"
                          className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 pl-14 font-black text-lg text-gray-800 outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tempo Estimado (min)</label>
                    <div className="flex items-center gap-4">
                       <input type="text" value="30" className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-center font-black" />
                       <span className="text-gray-300 font-bold uppercase text-[10px]">até</span>
                       <input type="text" value="45" className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-center font-black" />
                    </div>
                 </div>

                 <div className="flex justify-between items-center group cursor-pointer" onClick={() => {}}>
                    <div>
                       <p className="font-black text-gray-800 text-sm">Aceitar Retirada?</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">O cliente busca na loja</p>
                    </div>
                    <div className="w-12 h-6 bg-emerald-600 rounded-full relative flex items-center px-1 shadow-inner">
                       <div className="w-4 h-4 bg-white rounded-full shadow-md translate-x-6" />
                    </div>
                 </div>
              </div>
           </section>

           {/* Horários */}
           <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 bg-[#fafbfc]">
                <h3 className="font-black text-gray-800 flex items-center gap-3">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">🕒</span>
                  Horários de Funcionamento
                </h3>
              </div>
              <div className="p-8 space-y-6">
                 {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].map(dia => (
                   <div key={dia} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-black text-gray-700 text-xs">{dia}</span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase">Aberto</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="bg-[#f8fafc] border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-black text-gray-600">09:00 AM</div>
                        <span className="text-gray-300 text-xs">-</span>
                        <div className="bg-[#f8fafc] border border-gray-100 rounded-lg px-3 py-2 text-[10px] font-black text-gray-600">06:00 PM</div>
                      </div>
                   </div>
                 ))}
                 <div className="flex items-center justify-between opacity-40">
                    <span className="font-black text-gray-400 text-xs">Sábado</span>
                    <span className="text-[9px] font-black text-red-400 uppercase">Fechado</span>
                 </div>
                 <div className="flex items-center justify-between opacity-40">
                    <span className="font-black text-gray-400 text-xs">Domingo</span>
                    <span className="text-[9px] font-black text-red-400 uppercase">Fechado</span>
                 </div>
                 
                 <button className="w-full mt-4 py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-emerald-500 hover:text-emerald-600 transition-all">Editar todos os horários</button>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};
