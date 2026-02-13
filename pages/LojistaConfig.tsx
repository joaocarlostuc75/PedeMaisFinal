
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { convertFileToBase64 } from '../utils';

export const LojistaConfig = () => {
  const { lojas, updateLoja, addNotification, user } = useStore();
  const minhaLoja = user?.lojaId ? lojas.find(l => l.id === user.lojaId) || lojas[0] : lojas[0];
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nome: minhaLoja.nome,
    whatsapp: minhaLoja.whatsapp,
    endereco: minhaLoja.endereco || '',
    taxaEntrega: minhaLoja.taxaEntrega || 5.90,
    tempoMin: minhaLoja.tempoMin || 30,
    tempoMax: minhaLoja.tempoMax || 45,
    categoria: minhaLoja.categoria || 'Restaurante',
    aceitaRetirada: minhaLoja.aceitaRetirada ?? true,
    descricao: minhaLoja.descricao || '',
    email: minhaLoja.email || '',
    telefone: minhaLoja.telefone || ''
  });

  // Atualiza o formulário se a loja mudar
  useEffect(() => {
      setForm({
        nome: minhaLoja.nome,
        whatsapp: minhaLoja.whatsapp,
        endereco: minhaLoja.endereco || '',
        taxaEntrega: minhaLoja.taxaEntrega || 5.90,
        tempoMin: minhaLoja.tempoMin || 30,
        tempoMax: minhaLoja.tempoMax || 45,
        categoria: minhaLoja.categoria || 'Restaurante',
        aceitaRetirada: minhaLoja.aceitaRetirada ?? true,
        descricao: minhaLoja.descricao || '',
        email: minhaLoja.email || '',
        telefone: minhaLoja.telefone || ''
      });
  }, [minhaLoja]);

  const handleSave = () => {
    updateLoja(minhaLoja.id, form);
    addNotification('success', 'Configurações da loja atualizadas com sucesso!');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addNotification('error', 'A imagem deve ter no máximo 2MB.');
        return;
      }
      try {
        const base64 = await convertFileToBase64(file);
        updateLoja(minhaLoja.id, { [field]: base64 });
        addNotification('success', `${field === 'logo' ? 'Logo' : 'Banner'} atualizado!`);
      } catch (err) {
        addNotification('error', 'Erro ao processar imagem.');
      }
    }
  };

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
           <Link 
              to={`/loja/${minhaLoja.slug}`} 
              target="_blank"
              className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold text-sm text-gray-700 shadow-sm hover:bg-gray-50 transition-all flex items-center"
           >
              Visualizar Loja
           </Link>
           <button onClick={handleSave} className="bg-[#2d7a3a] text-white px-6 py-3 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-900/10 hover:bg-[#256631] transition-all">
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
                   <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'banner')} />
                   <div 
                      onClick={() => bannerInputRef.current?.click()}
                      className="w-full h-48 bg-gray-100 rounded-3xl overflow-hidden relative group cursor-pointer border-2 border-dashed border-gray-200 hover:border-emerald-500 transition-all"
                   >
                      {minhaLoja.banner ? (
                          <img src={minhaLoja.banner} className="w-full h-full object-cover" />
                      ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                              <span className="text-4xl mb-2">🖼️</span>
                              <span className="text-xs font-bold">Sem banner</span>
                          </div>
                      )}
                      <div className="absolute inset-0 bg-white/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                         <p className="font-black text-xs text-gray-800 uppercase tracking-widest">Alterar Capa</p>
                      </div>
                   </div>
                </div>

                <div className="flex items-center gap-8">
                   <div className="relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} />
                      <div className="w-32 h-32 bg-emerald-600 rounded-full border-8 border-white shadow-xl overflow-hidden flex items-center justify-center bg-gray-100 relative group-hover:scale-105 transition-transform">
                        {minhaLoja.logo ? (
                            <img src={minhaLoja.logo} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">🏪</span>
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-black">EDITAR</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex-1">
                      <h4 className="font-black text-gray-800 text-lg">Logo da Marca</h4>
                      <p className="text-xs text-gray-400 font-medium leading-relaxed mt-1">Este logo aparecerá no seu perfil e nas notas de pedido. Formato quadrado (1:1).</p>
                      <button onClick={() => logoInputRef.current?.click()} className="mt-4 text-emerald-600 font-black text-xs uppercase hover:underline">Carregar nova imagem</button>
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
                      type="text" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})}
                      className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                   />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp para Pedidos</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">📱</span>
                         <input 
                            type="text" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})}
                            className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 pl-12 pr-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                         />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Categoria Principal</label>
                      <select 
                        value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}
                        className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none appearance-none transition-all">
                         <option>Mercado & Conveniência</option>
                         <option>Restaurante</option>
                         <option>Padaria</option>
                         <option>Farmácia</option>
                         <option>Lanches</option>
                         <option>Outros</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Descrição Curta</label>
                   <textarea 
                      value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
                      className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 font-medium text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all h-32 resize-none"
                      placeholder="Fale um pouco sobre sua loja..."
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Endereço Completo</label>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">📍</span>
                      <input 
                        type="text" value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})}
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
                          type="number" step="0.01" value={form.taxaEntrega} onChange={e => setForm({...form, taxaEntrega: Number(e.target.value)})}
                          className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 pl-14 font-black text-lg text-gray-800 outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tempo Estimado (min)</label>
                    <div className="flex items-center gap-4">
                       <input type="number" value={form.tempoMin} onChange={e => setForm({...form, tempoMin: Number(e.target.value)})} className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-center font-black" />
                       <span className="text-gray-300 font-bold uppercase text-[10px]">até</span>
                       <input type="number" value={form.tempoMax} onChange={e => setForm({...form, tempoMax: Number(e.target.value)})} className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 px-6 text-center font-black" />
                    </div>
                 </div>

                 <div className="flex justify-between items-center group cursor-pointer" onClick={() => setForm({...form, aceitaRetirada: !form.aceitaRetirada})}>
                    <div>
                       <p className="font-black text-gray-800 text-sm">Aceitar Retirada?</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">O cliente busca na loja</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative flex items-center px-1 shadow-inner transition-colors ${form.aceitaRetirada ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${form.aceitaRetirada ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};
