
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';

export const SuperAdminConfig = () => {
  const { systemSettings, updateSystemSettings, addNotification } = useStore();
  const [form, setForm] = useState(systemSettings);

  useEffect(() => {
    setForm(systemSettings);
  }, [systemSettings]);

  const handleSave = () => {
    updateSystemSettings(form);
    addNotification('success', 'Configurações do sistema atualizadas!');
  };

  return (
    <div className="max-w-5xl mx-auto p-8 animate-fade-in font-sans pb-20">
      <header className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Configurações Globais</h1>
        <p className="text-gray-500 font-bold mt-1">Parâmetros críticos de funcionamento da plataforma.</p>
      </header>

      <div className="grid gap-8">
        
        {/* Identidade do Sistema */}
        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-emerald-600">🌍</span> Identidade & Contato
           </h3>
           <div className="grid md:grid-cols-2 gap-6">
              <div>
                 <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Nome da Aplicação</label>
                 <input 
                    type="text" 
                    value={form.appName}
                    onChange={e => setForm({...form, appName: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
              </div>
              <div>
                 <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Telefone de Suporte</label>
                 <input 
                    type="text" 
                    value={form.supportPhone}
                    onChange={e => setForm({...form, supportPhone: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
              </div>
              <div className="md:col-span-2">
                 <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Chave PIX Financeira</label>
                 <input 
                    type="text" 
                    value={form.pixKey}
                    onChange={e => setForm({...form, pixKey: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                 />
              </div>
           </div>
        </section>

        {/* Controles de Risco */}
        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-red-500">🚨</span> Zona de Perigo & Controle
           </h3>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div>
                    <p className="font-black text-gray-800">Modo Manutenção</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">Bloqueia acesso a todas as lojas e painéis (exceto Super Admin).</p>
                 </div>
                 <div className="relative cursor-pointer" onClick={() => setForm({...form, maintenanceMode: !form.maintenanceMode})}>
                    <div className={`w-14 h-8 rounded-full transition-colors ${form.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${form.maintenanceMode ? 'translate-x-7 left-0' : 'translate-x-1 left-0'}`} />
                 </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div>
                    <p className="font-black text-gray-800">Novos Cadastros</p>
                    <p className="text-xs text-gray-500 font-medium mt-1">Permitir que novos lojistas criem contas na landing page.</p>
                 </div>
                 <div className="relative cursor-pointer" onClick={() => setForm({...form, allowNewRegistrations: !form.allowNewRegistrations})}>
                    <div className={`w-14 h-8 rounded-full transition-colors ${form.allowNewRegistrations ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${form.allowNewRegistrations ? 'translate-x-7 left-0' : 'translate-x-1 left-0'}`} />
                 </div>
              </div>
           </div>
        </section>

        {/* Comunicação */}
        <section className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-blue-500">📢</span> Anúncio Global
           </h3>
           <div>
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Mensagem do Banner</label>
              <textarea 
                 value={form.globalAnnouncement}
                 onChange={e => setForm({...form, globalAnnouncement: e.target.value})}
                 className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none placeholder-blue-300"
                 placeholder="Digite uma mensagem para aparecer no topo de todos os painéis..."
              />
              <p className="text-[10px] text-gray-400 font-bold mt-2 text-right">Deixe em branco para desativar.</p>
           </div>
        </section>

        <button 
           onClick={handleSave}
           className="bg-gray-900 text-white w-full py-6 rounded-[2rem] font-black text-lg tracking-widest shadow-2xl hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95"
        >
           SALVAR ALTERAÇÕES GLOBAIS
        </button>

      </div>
    </div>
  );
};
