
import React from 'react';

export const LojistaAreasEntrega = () => {
  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 font-sans">
      <div className="w-full md:w-[450px] shrink-0 space-y-6 overflow-y-auto no-scrollbar pr-2 pb-10">
        <header className="mb-8">
           <h1 className="text-3xl font-black text-gray-900 tracking-tight">Áreas de Entrega</h1>
           <p className="text-gray-500 font-medium mt-1 leading-tight">Configure seus perímetros e taxas.</p>
        </header>

        <button className="w-full bg-[#2d7a3a] text-white py-5 rounded-2xl font-black text-sm tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-[#256631] transition-all flex items-center justify-center gap-3 mb-10">
           <span className="text-xl leading-none">📍</span> Adicionar Nova Área
        </button>

        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-emerald-500 shadow-xl overflow-hidden relative group p-8">
              <div className="absolute top-8 right-8 flex gap-2">
                 <button className="text-gray-300 hover:text-emerald-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                 </button>
                 <button className="text-gray-300 hover:text-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                 </button>
              </div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Zona Ativa</p>
              <h4 className="text-xl font-black text-gray-800 mb-6">Centro Histórico</h4>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Taxa</p>
                    <p className="font-black text-gray-700">R$ 5,00 <span className="text-[9px] text-gray-400 font-bold italic ml-1">Fixa</span></p>
                 </div>
                 <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tempo</p>
                    <p className="font-black text-gray-700">20-30 min</p>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative group p-8 opacity-60 hover:opacity-100 transition-opacity">
              <div className="absolute top-8 right-8 flex gap-2">
                 <button className="text-gray-300 hover:text-emerald-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg></button>
                 <button className="text-gray-300 hover:text-red-500 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
              </div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Zona Ativa</p>
              <h4 className="text-xl font-black text-gray-800 mb-6">Zona Norte (Expansão)</h4>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Taxa</p>
                    <p className="font-black text-gray-700">R$ 1,50 <span className="text-[9px] text-gray-400 font-bold italic ml-1">por KM</span></p>
                 </div>
                 <div className="bg-[#f8fafc] p-4 rounded-2xl border border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Tempo</p>
                    <p className="font-black text-gray-700">35-50 min</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="pt-10 space-y-6">
           <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] mb-4">Configuração Geral da Área</p>
           
           <div className="bg-[#f1f5f9] p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <span className="text-lg">⌨️</span>
                 <p className="text-[11px] font-black text-gray-600 uppercase">Calcular por KM</p>
              </div>
              <div className="w-10 h-5 bg-gray-300 rounded-full relative flex items-center px-1 shadow-inner">
                 <div className="w-3 h-3 bg-white rounded-full shadow-md translate-x-0" />
              </div>
           </div>

           <div className="bg-[#f1f5f9] p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <span className="text-lg">⏲️</span>
                 <p className="text-[11px] font-black text-gray-600 uppercase">Exibir tempo real</p>
              </div>
              <div className="w-10 h-5 bg-emerald-500 rounded-full relative flex items-center px-1 shadow-inner">
                 <div className="w-3 h-3 bg-white rounded-full shadow-md translate-x-5" />
              </div>
           </div>
        </div>
        
        <div className="pt-12 text-center text-[8px] font-black text-gray-300 uppercase tracking-[0.3em]">
           Pede Mais Logistics Engine v2.4
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden relative">
         <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-20" />
         
         <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-6">
            <div className="relative group">
               <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
               <input type="text" placeholder="Buscar endereço para delimitar..." className="w-full bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl py-4 pl-12 pr-6 font-bold text-xs text-gray-700 shadow-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none" />
            </div>
         </div>

         {/* Controles de Mapa Flutuantes */}
         <div className="absolute top-1/2 -translate-y-1/2 right-8 flex flex-col gap-2">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
               <button className="p-4 hover:bg-gray-50 border-b border-gray-50 text-gray-400 hover:text-emerald-600 transition-colors"><span className="text-xl">✋</span></button>
               <button className="p-4 hover:bg-emerald-50 bg-emerald-50 text-emerald-600 border-b border-gray-50 transition-colors"><span className="text-xl">⬠</span></button>
               <button className="p-4 hover:bg-gray-50 text-gray-400 transition-colors"><span className="text-xl">○</span></button>
            </div>
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col mt-4">
               <button className="p-4 hover:bg-gray-50 border-b border-gray-50 text-gray-400 font-black text-xl">+</button>
               <button className="p-4 hover:bg-gray-50 text-gray-400 font-black text-xl">-</button>
            </div>
            <button className="w-14 h-14 bg-white rounded-xl shadow-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-emerald-600 mt-4 transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
         </div>

         {/* Polígono Simulado */}
         <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000">
            <path 
               d="M550,300 L750,350 L780,480 L650,550 L520,490 Z" 
               fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="3" strokeDasharray="6,6"
            />
            <circle cx="650" cy="420" r="6" fill="#10b981" />
         </svg>

         {/* Legenda de Mapa */}
         <div className="absolute bottom-8 right-8 bg-white p-6 rounded-[2rem] shadow-3xl border border-gray-100 min-w-[200px]">
            <h5 className="text-[10px] font-black text-gray-800 uppercase tracking-widest mb-4">Legenda</h5>
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-emerald-100 border border-emerald-500 rounded" />
                  <span className="text-[9px] font-black text-gray-400 uppercase">Área de Entrega Ativa</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gray-50 border border-dashed border-gray-300 rounded" />
                  <span className="text-[9px] font-black text-gray-400 uppercase">Área em Rascunho</span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-emerald-600 rounded-full" />
                  <span className="text-[9px] font-black text-gray-400 uppercase">Ponto Central (Sede)</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
