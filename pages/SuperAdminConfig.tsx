
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { convertFileToBase64 } from '../utils';

export const SuperAdminConfig = () => {
  const { systemSettings, updateSystemSettings, user, updateCurrentUser, addNotification } = useStore();
  const [form, setForm] = useState(systemSettings);
  const [userForm, setUserForm] = useState({
      nome: user?.nome || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
  });
  const [newCategory, setNewCategory] = useState('');
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(systemSettings);
  }, [systemSettings]);
  
  useEffect(() => {
      if(user) {
          setUserForm({
              nome: user.nome,
              email: user.email,
              avatar: user.avatar || ''
          })
      }
  }, [user]);

  const handleSave = () => {
    updateSystemSettings(form);
    addNotification('success', 'Configurações do sistema atualizadas!');
  };

  const handleSaveProfile = () => {
      updateCurrentUser(userForm);
      addNotification('success', 'Perfil atualizado com sucesso!');
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification('error', 'A imagem deve ter no máximo 2MB.');
        return;
      }
      try {
        const base64 = await convertFileToBase64(file);
        setUserForm(prev => ({...prev, avatar: base64}));
      } catch (err) {
        addNotification('error', 'Erro ao processar imagem.');
      }
    }
  };

  const addStoreCategory = () => {
      if (!newCategory.trim()) return;
      const cats = form.storeCategories || [];
      if (cats.includes(newCategory)) {
          addNotification('error', 'Categoria já existe.');
          return;
      }
      const updatedCats = [...cats, newCategory.trim()];
      setForm({...form, storeCategories: updatedCats});
      setNewCategory('');
  };

  const removeStoreCategory = (cat: string) => {
      const updatedCats = (form.storeCategories || []).filter(c => c !== cat);
      setForm({...form, storeCategories: updatedCats});
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-fade-in font-sans pb-24">
      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">Configurações Globais</h1>
        <p className="text-gray-500 font-bold mt-1 text-xs md:text-base">Parâmetros críticos de funcionamento da plataforma.</p>
      </header>

      <div className="grid gap-6 md:gap-8">
        
        {/* Perfil do Administrador */}
        <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-lg md:text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-emerald-600">👤</span> Perfil do Administrador
           </h3>
           <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
               <div className="flex flex-col items-center gap-4">
                   <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                   <div 
                        onClick={() => avatarInputRef.current?.click()}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-emerald-500 overflow-hidden cursor-pointer hover:opacity-80 transition-all relative group bg-gray-100"
                   >
                       {userForm.avatar ? (
                           <img src={userForm.avatar} className="w-full h-full object-cover" />
                       ) : (
                           <img src={`https://i.pravatar.cc/150?u=${user?.id}`} className="w-full h-full object-cover" />
                       )}
                       <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-xs font-black text-white uppercase">Alterar</span>
                       </div>
                   </div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-emerald-600" onClick={() => avatarInputRef.current?.click()}>Alterar Foto</p>
               </div>
               
               <div className="flex-1 w-full space-y-4">
                   <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Nome de Exibição</label>
                        <input 
                            type="text" 
                            value={userForm.nome}
                            onChange={e => setUserForm({...userForm, nome: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                   </div>
                   <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">E-mail de Acesso</label>
                        <input 
                            type="email" 
                            value={userForm.email}
                            onChange={e => setUserForm({...userForm, email: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                   </div>
                   <button 
                       onClick={handleSaveProfile}
                       className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-emerald-500 transition-all w-full md:w-auto self-end"
                   >
                       Salvar Perfil
                   </button>
               </div>
           </div>
        </section>

        {/* Identidade do Sistema */}
        <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-lg md:text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-blue-500">🌍</span> Identidade & Contato
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Gestão de Categorias de Lojas */}
        <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-lg md:text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-purple-500">🏷️</span> Categorias de Estabelecimento
           </h3>
           <div className="space-y-4">
               <div className="flex flex-col md:flex-row gap-4">
                   <input 
                        type="text"
                        placeholder="Nova categoria (ex: Floricultura)"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        className="flex-1 bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-purple-500 outline-none"
                        onKeyDown={e => e.key === 'Enter' && addStoreCategory()}
                   />
                   <button onClick={addStoreCategory} className="bg-purple-600 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-purple-500 transition-all">
                       Adicionar
                   </button>
               </div>
               <div className="flex flex-wrap gap-2">
                   {(form.storeCategories || []).map((cat, idx) => (
                       <div key={idx} className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 border border-purple-100">
                           {cat}
                           <button onClick={() => removeStoreCategory(cat)} className="w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center text-xs text-purple-800 hover:bg-purple-300 transition-colors">✕</button>
                       </div>
                   ))}
               </div>
           </div>
        </section>

        {/* Controles de Risco */}
        <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-lg md:text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <span className="text-red-500">🚨</span> Zona de Perigo & Controle
           </h3>
           
           <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div>
                    <p className="font-black text-gray-800 text-sm md:text-base">Modo Manutenção</p>
                    <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">Bloqueia acesso a todas as lojas e painéis.</p>
                 </div>
                 <div className="relative cursor-pointer" onClick={() => setForm({...form, maintenanceMode: !form.maintenanceMode})}>
                    <div className={`w-12 md:w-14 h-7 md:h-8 rounded-full transition-colors ${form.maintenanceMode ? 'bg-red-500' : 'bg-gray-300'}`} />
                    <div className={`absolute top-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transition-transform ${form.maintenanceMode ? 'translate-x-6 md:translate-x-7 left-0' : 'translate-x-1 left-0'}`} />
                 </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                 <div>
                    <p className="font-black text-gray-800 text-sm md:text-base">Novos Cadastros</p>
                    <p className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">Permitir novos lojistas na landing page.</p>
                 </div>
                 <div className="relative cursor-pointer" onClick={() => setForm({...form, allowNewRegistrations: !form.allowNewRegistrations})}>
                    <div className={`w-12 md:w-14 h-7 md:h-8 rounded-full transition-colors ${form.allowNewRegistrations ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                    <div className={`absolute top-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-md transition-transform ${form.allowNewRegistrations ? 'translate-x-6 md:translate-x-7 left-0' : 'translate-x-1 left-0'}`} />
                 </div>
              </div>
           </div>
        </section>

        {/* Comunicação */}
        <section className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
           <h3 className="text-lg md:text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
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
