
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils';

type Step = 1 | 2 | 3;

export const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    responsavel: '',
    whatsapp: '',
    email: '',
    nomeLoja: '',
    ramo: 'Restaurante',
    taxaTipo: 'fixa' as 'fixa' | 'distancia',
    taxaValor: 0,
    tempoEntrega: '30-45 min',
    retirada: true,
    endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo'
  });

  const slug = form.nomeLoja.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const handleNext = () => {
    if (step < 3) setStep((step + 1) as Step);
    else {
      alert('Configuração concluída com sucesso!');
      navigate('/admin/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f1f4f9] flex flex-col font-sans">
      {/* Header Stepper */}
      <header className="bg-white px-8 py-6 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xl">M</div>
          <span className="text-xl font-black text-gray-900 tracking-tighter">Pede Mais</span>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 1 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <span className={`text-xs font-bold uppercase tracking-widest ${step === 1 ? 'text-gray-900' : 'text-gray-400'}`}>Dados Básicos</span>
          </div>
          <div className="w-12 h-[2px] bg-gray-100">
            <div className={`h-full bg-emerald-500 transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 2 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>2</div>
            <span className={`text-xs font-bold uppercase tracking-widest ${step === 2 ? 'text-gray-900' : 'text-gray-400'}`}>Identidade Visual</span>
          </div>
          <div className="w-12 h-[2px] bg-gray-100">
             <div className={`h-full bg-emerald-500 transition-all duration-500 ${step >= 3 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 3 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>3</div>
            <span className={`text-xs font-bold uppercase tracking-widest ${step === 3 ? 'text-gray-900' : 'text-gray-400'}`}>Pagamento</span>
          </div>
        </div>

        <button onClick={() => navigate('/')} className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Salvar e Sair</button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
        {/* Step 1: Dados Básicos */}
        {step === 1 && (
          <div className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
            <div className="p-12 md:p-16">
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Vamos começar</h2>
              <p className="text-gray-400 font-medium mb-12">Preencha as informações iniciais para criar sua identidade digital.</p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome do Responsável</label>
                  <div className="relative">
                    <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    <input 
                      type="text" placeholder="Ex: João Silva" 
                      className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-14 pr-4 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">WhatsApp de Contato</label>
                  <input 
                    type="text" placeholder="(00) 00000-0000" 
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">E-mail</label>
                <div className="relative">
                  <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <input 
                    type="email" placeholder="seu@email.com" 
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-14 pr-4 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Nome da Loja</label>
                <div className="relative">
                  <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  <input 
                    type="text" placeholder="Ex: Burger do João" 
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-4 pl-14 pr-12 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    value={form.nomeLoja} onChange={e => setForm({...form, nomeLoja: e.target.value})}
                  />
                  {form.nomeLoja && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-3xl p-8 flex items-center justify-between border border-gray-100 group transition-all hover:bg-white hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-emerald-500 shadow-sm border border-gray-100">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Preview do seu link</p>
                    <p className="font-medium text-gray-800 tracking-tight">pedemais.app/loja/<span className="font-black text-emerald-600">{slug || 'sua-loja'}</span></p>
                  </div>
                </div>
                <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Disponível</div>
              </div>

              <div className="mt-16 flex justify-end">
                <button 
                  onClick={handleNext}
                  className="bg-[#0f172a] text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl flex items-center gap-4 hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95"
                >
                  Próximo
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Identidade Visual */}
        {step === 2 && (
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 animate-fade-in">
            <div className="flex-1 space-y-12">
              <div>
                <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter leading-none">Defina a cara da sua loja</h2>
                <p className="text-xl text-gray-400 font-medium">Essas imagens aparecerão para seus clientes no app. Capriche na escolha!</p>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">🏪</div>
                  Logotipo da Loja
                </h3>
                <div className="flex flex-col md:flex-row items-center gap-10">
                   <div className="w-48 h-48 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-emerald-500 hover:text-emerald-500 cursor-pointer transition-all group">
                      <svg className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      <span className="text-xs font-black uppercase tracking-widest">Upload</span>
                   </div>
                   <div className="flex-1 space-y-4">
                      <p className="text-gray-400 font-medium leading-relaxed">Arraste sua imagem aqui ou clique para buscar.<br/>Recomendado: 500x500px, formato JPG ou PNG. Máximo 2MB.</p>
                      <button className="text-emerald-600 font-black text-sm hover:underline underline-offset-4 decoration-2">Escolher arquivo</button>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">🖼️</div>
                  Capa / Banner
                </h3>
                <div className="w-full h-48 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-emerald-500 transition-all cursor-pointer group">
                  <svg className="w-10 h-10 mb-2 group-hover:translate-y-[-4px] transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                  <p className="text-xs font-black uppercase tracking-widest">Arraste a imagem de capa aqui</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-2">Recomendado: 1000x400px</p>
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Qual o seu ramo de atividade?</h3>
                <p className="text-lg text-gray-400 font-medium mb-8">Isso ajuda os clientes a encontrarem sua loja na categoria certa.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Restaurante', icon: '🍴', color: 'bg-orange-100 text-orange-600' },
                    { label: 'Mercado', icon: '🛒', color: 'bg-blue-100 text-blue-600' },
                    { label: 'Lanches', icon: '🍔', color: 'bg-yellow-100 text-yellow-600' },
                    { label: 'Pet Shop', icon: '🐾', color: 'bg-purple-100 text-purple-600' },
                    { label: 'Farmácia', icon: '💊', color: 'bg-red-100 text-red-600' },
                    { label: 'Outros', icon: '✨', color: 'bg-gray-100 text-gray-600' }
                  ].map(cat => (
                    <button 
                      key={cat.label} 
                      onClick={() => setForm({...form, ramo: cat.label})}
                      className={`p-8 rounded-[2rem] flex flex-col items-center justify-center text-center transition-all border-4 ${form.ramo === cat.label ? 'bg-emerald-50 border-emerald-500 shadow-xl scale-105' : 'bg-white border-transparent hover:border-gray-100 shadow-sm'}`}
                    >
                      <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center text-3xl mb-4`}>{cat.icon}</div>
                      <span className="font-black text-gray-800 text-lg">{cat.label}</span>
                      {form.ramo === cat.label && (
                        <div className="mt-4 bg-emerald-500 w-6 h-6 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Preview */}
            <div className="hidden lg:block w-[400px] shrink-0 sticky top-32 h-fit">
              <div className="text-center mb-6 flex items-center justify-center gap-3">
                 <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                 <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Pré-visualização no App</span>
              </div>
              <div className="bg-white p-6 rounded-[3.5rem] shadow-3xl border border-gray-100 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-gray-900 rounded-b-3xl z-10" />
                 <div className="aspect-[9/19] bg-gray-50 rounded-[2.5rem] overflow-hidden border-8 border-gray-900 relative shadow-inner">
                    <div className="h-40 bg-gray-200 relative">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                       <div className="absolute top-12 left-6 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                       </div>
                       <div className="absolute top-12 right-6 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                       </div>
                    </div>
                    <div className="px-6 -mt-8 relative z-20">
                       <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center text-4xl border-4 border-white">🏪</div>
                       <div className="mt-6 flex justify-between items-center">
                          <h4 className="text-2xl font-black text-gray-900 tracking-tighter truncate w-40">{form.nomeLoja || 'Nome da Loja'}</h4>
                          <div className="bg-emerald-50 px-3 py-1 rounded-lg text-emerald-600 text-[10px] font-black uppercase">Grátis</div>
                       </div>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-gray-800">⭐ 5.0</span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{form.ramo} • 0.5 km</span>
                       </div>
                       
                       <div className="mt-8 flex gap-4 overflow-hidden border-b border-gray-100 pb-4">
                          <span className="text-xs font-black text-emerald-600 border-b-4 border-emerald-500 pb-4">Destaques</span>
                          <span className="text-xs font-bold text-gray-400 pb-4">Lanches</span>
                          <span className="text-xs font-bold text-gray-400 pb-4">Bebidas</span>
                       </div>

                       <div className="mt-8 space-y-6">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-4">
                               <div className="w-16 h-16 bg-gray-200 rounded-2xl shrink-0" />
                               <div className="flex-1 space-y-2">
                                  <div className="w-full h-4 bg-gray-100 rounded-full" />
                                  <div className="w-2/3 h-3 bg-gray-50 rounded-full" />
                                  <div className="font-black text-xs text-gray-800">R$ {20 + i*5}</div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="mt-8 bg-blue-50 p-6 rounded-3xl border border-blue-100 flex gap-4 items-start animate-fade-in">
                 <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 text-xs font-black">i</div>
                 <p className="text-[11px] text-blue-700 font-bold leading-relaxed">A pré-visualização é atualizada automaticamente quando você faz o upload das imagens.</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Logística */}
        {step === 3 && (
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-12 animate-fade-in">
             <div className="flex-1 space-y-12">
                <div>
                   <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Configurações de Entrega</h2>
                   <p className="text-xl text-gray-400 font-medium">Defina como seus produtos chegarão até seus clientes de forma eficiente.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                   <h3 className="text-xl font-black text-gray-900 flex items-center gap-4 mb-10">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">🛵</div>
                      Taxa de Entrega
                   </h3>
                   <div className="grid md:grid-cols-2 gap-6 mb-10">
                      <button 
                        onClick={() => setForm({...form, taxaTipo: 'fixa'})}
                        className={`p-6 rounded-[2rem] text-left transition-all border-4 flex items-start gap-4 ${form.taxaTipo === 'fixa' ? 'bg-emerald-50 border-emerald-500 shadow-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-sm'}`}
                      >
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${form.taxaTipo === 'fixa' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}>
                            {form.taxaTipo === 'fixa' && <div className="w-2 h-2 bg-white rounded-full" />}
                         </div>
                         <div>
                            <p className="font-black text-gray-800">Taxa Fixa</p>
                            <p className="text-xs font-bold text-gray-400 mt-1">Valor único para qualquer distância.</p>
                         </div>
                      </button>
                      <button 
                        onClick={() => setForm({...form, taxaTipo: 'distancia'})}
                        className={`p-6 rounded-[2rem] text-left transition-all border-4 flex items-start gap-4 ${form.taxaTipo === 'distancia' ? 'bg-emerald-50 border-emerald-500 shadow-xl' : 'bg-white border-transparent hover:border-gray-100 shadow-sm'}`}
                      >
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 transition-all ${form.taxaTipo === 'distancia' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-200'}`}>
                            {form.taxaTipo === 'distancia' && <div className="w-2 h-2 bg-white rounded-full" />}
                         </div>
                         <div>
                            <p className="font-black text-gray-800">Por Distância (KM)</p>
                            <p className="text-xs font-bold text-gray-400 mt-1">Valor calculado com base na distância.</p>
                         </div>
                      </button>
                   </div>
                   
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Valor da Taxa (R$)</label>
                      <div className="relative max-w-xs">
                         <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400 text-lg">R$</span>
                         <input 
                           type="number" step="0.01" 
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-14 pr-4 font-black text-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                           value={form.taxaValor} onChange={e => setForm({...form, taxaValor: Number(e.target.value)})}
                         />
                      </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                   <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                      <h3 className="text-xl font-black text-gray-900 flex items-center gap-4 mb-6">
                         <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">⏱️</div>
                         Tempo Médio de Entrega
                      </h3>
                      <div className="relative">
                         <select 
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 px-12 font-bold text-gray-700 outline-none appearance-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                           value={form.tempoEntrega} onChange={e => setForm({...form, tempoEntrega: e.target.value})}
                         >
                            <option>15-30 min</option>
                            <option>30-45 min</option>
                            <option>45-60 min</option>
                            <option>60+ min</option>
                         </select>
                         <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                         <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
                      </div>
                   </div>
                   <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex justify-between items-center group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">🏠</div>
                         <div>
                            <p className="font-black text-gray-800">Retirada no Local</p>
                            <p className="text-xs font-bold text-gray-400 mt-1">Cliente busca na loja</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => setForm({...form, retirada: !form.retirada})}
                        className={`w-16 h-10 rounded-full transition-all relative flex items-center px-1 ${form.retirada ? 'bg-emerald-500 shadow-lg' : 'bg-gray-200'}`}
                      >
                         <div className={`w-8 h-8 bg-white rounded-full shadow-md transition-all ${form.retirada ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                   </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                   <h3 className="text-xl font-black text-gray-900 flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">📍</div>
                      Localização da Loja
                   </h3>
                   <div className="relative mb-8">
                      <svg className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                      <input 
                        type="text" placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo" 
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-5 pl-14 pr-24 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})}
                      />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">Buscar</button>
                   </div>
                   <div className="w-full h-80 bg-emerald-50 rounded-[2.5rem] border-2 border-emerald-100 relative overflow-hidden group shadow-inner">
                      {/* Simulação de Mapa */}
                      <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 mix-blend-multiply" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-emerald-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
                         <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                      <div className="absolute bottom-6 right-6 bg-white px-6 py-3 rounded-2xl shadow-xl border border-gray-100 font-bold text-xs text-gray-600">Arraste para ajustar</div>
                   </div>
                </div>
             </div>

             {/* Sidebar Info */}
             <div className="hidden lg:block w-[400px] shrink-0 sticky top-32 h-fit">
                <div className="bg-emerald-500 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-3xl">
                   <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                   <div className="relative z-10">
                      <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-4xl mb-12 shadow-2xl animate-pulse">🚀</div>
                      <h3 className="text-4xl font-black mb-8 tracking-tighter leading-none">Sua loja está quase pronta!</h3>
                      <p className="text-emerald-50 text-xl font-medium leading-relaxed mb-12 opacity-80">Configure a logística e comece a vender para milhares de clientes na região.</p>
                      
                      <div className="flex items-center gap-6">
                         <div className="flex -space-x-4">
                            {[1, 2, 3].map(i => (
                               <div key={i} className="w-12 h-12 rounded-full border-4 border-emerald-500 overflow-hidden shadow-lg">
                                  <img src={`https://picsum.photos/100/100?random=${i}`} className="w-full h-full object-cover" />
                               </div>
                            ))}
                         </div>
                         <p className="text-xs font-black uppercase tracking-widest">+2.000 Lojas ativas</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Floating Actions */}
        <div className="fixed bottom-0 left-0 w-full p-8 md:p-12 pointer-events-none flex justify-center z-50">
          <div className="w-full max-w-7xl flex justify-between items-center pointer-events-auto">
            <button 
              onClick={handleBack}
              className="bg-white border-2 border-gray-100 text-gray-400 px-10 py-5 rounded-[2rem] font-black text-xl hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-xl active:scale-95"
            >
              Voltar
            </button>
            
            {step === 3 ? (
              <button 
                onClick={handleNext}
                className="bg-emerald-600 text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl flex items-center gap-4 hover:bg-emerald-500 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Concluir Configuração
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              </button>
            ) : step === 2 && (
              <button 
                onClick={handleNext}
                className="bg-emerald-500 text-white px-12 py-5 rounded-[2rem] font-black text-xl shadow-2xl flex items-center gap-4 hover:bg-emerald-600 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                Próximo
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Decorative patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[-1] overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>
    </div>
  );
};
