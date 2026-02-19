
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

type Step = 1 | 2 | 3;

export const Onboarding = () => {
  const navigate = useNavigate();
  const { setUser, addLoja, planos, addNotification } = useStore();
  const [step, setStep] = useState<Step>(1);
  // Garante que o plano selecionado padrão não seja privado
  const publicPlanos = planos.filter(p => !p.privado);
  const [selectedPlan, setSelectedPlan] = useState(publicPlanos[0]?.id || '1'); 
  
  // Referências para os inputs de arquivo invisíveis
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    responsavel: '',
    whatsapp: '',
    email: '',
    nomeLoja: '',
    ramo: 'Restaurante',
    endereco: '',
    logo: '',
    banner: ''
  });

  const slug = form.nomeLoja.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  const handleNext = () => {
    if (step === 1) {
        // VALIDAÇÃO RIGOROSA DO PASSO 1
        if (!form.responsavel.trim() || !form.whatsapp.trim() || !form.email.trim() || !form.nomeLoja.trim() || !form.endereco.trim()) {
            addNotification('error', 'Por favor, preencha todos os campos obrigatórios (Responsável, WhatsApp, E-mail, Nome da Loja e Endereço).');
            return;
        }
        setStep((step + 1) as Step);
    } else if (step === 2) {
        // Validação opcional para o passo 2 se desejar forçar logo/banner
        setStep((step + 1) as Step);
    } else {
        // FINALIZAR CADASTRO - CRIAÇÃO REAL DA LOJA
        const newLojaId = `loja-${Date.now()}`;
        
        addLoja({
            id: newLojaId,
            nome: form.nomeLoja.trim() || 'Nova Loja',
            slug: slug || `loja-${newLojaId}`,
            planoId: selectedPlan,
            // Status pendente para bloquear acesso e dados vazios
            statusAssinatura: 'pendente',
            proximoVencimento: new Date().toISOString(), // Vencido/Pendente de ativação
            whatsapp: form.whatsapp,
            categoria: form.ramo,
            endereco: form.endereco,
            banner: form.banner,
            logo: form.logo,
            email: form.email,
            taxaEntrega: 5.00,
            tempoMin: 30,
            tempoMax: 50,
            aceitaRetirada: true,
            // Stats zerados e arrays vazios (o store inicia arrays vazios para novas lojas)
            stats: { carrinhos: 0, finalizados: 0, mrr: 0 }
        });

        // Define o usuário como LOJISTA logado vinculado a esta nova loja
        setUser({
            id: `user-${Date.now()}`,
            nome: form.responsavel.trim() || 'Lojista',
            email: form.email || 'lojista@pedemais.app',
            role: 'lojista',
            lojaId: newLojaId
        });

        // Redireciona para o painel (que mostrará a tela de bloqueio)
        navigate('/admin/dashboard');
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
    else navigate('/');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setForm(prev => ({ ...prev, [field]: objectUrl }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f1f4f9] flex flex-col font-sans">
      {/* Header Stepper */}
      <header className="bg-white px-4 md:px-8 py-4 md:py-6 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-lg md:text-xl">M</div>
          <span className="text-lg md:text-xl font-black text-gray-900 tracking-tighter">Pede Mais</span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-12 hidden md:flex">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 1 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <span className={`text-xs font-bold uppercase tracking-widest ${step === 1 ? 'text-gray-900' : 'text-gray-400'}`}>Dados</span>
          </div>
          <div className="w-8 md:w-12 h-[2px] bg-gray-100">
            <div className={`h-full bg-emerald-500 transition-all duration-500 ${step >= 2 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 2 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>2</div>
            <span className={`text-xs font-bold uppercase tracking-widest ${step === 2 ? 'text-gray-900' : 'text-gray-400'}`}>Visual</span>
          </div>
          <div className="w-8 md:w-12 h-[2px] bg-gray-100">
             <div className={`h-full bg-emerald-500 transition-all duration-500 ${step >= 3 ? 'w-full' : 'w-0'}`} />
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= 3 ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>3</div>
            <span className={`text-xs font-bold uppercase tracking-widest ${step === 3 ? 'text-gray-900' : 'text-gray-400'}`}>Plano</span>
          </div>
        </div>

        {/* Mobile Step Indicator */}
        <div className="md:hidden flex gap-2">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-emerald-500' : 'bg-gray-200'}`} />
        </div>

        <button onClick={() => navigate('/')} className="text-[10px] md:text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Sair</button>
      </header>

      {/* Main Content - Removido justify-center para evitar conflito de scroll em telas menores */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-12 relative w-full pb-48 overflow-y-auto">
        {/* Step 1: Dados Básicos */}
        {step === 1 && (
          <div className="w-full max-w-3xl bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden animate-fade-in mb-32">
            <div className="p-6 md:p-16">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 md:mb-4 tracking-tighter">Vamos começar</h2>
              <p className="text-gray-400 font-medium mb-8 md:mb-12 text-sm md:text-base">Preencha as informações iniciais para criar sua identidade digital.</p>
              
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-10">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Nome do Responsável <span className="text-red-500">*</span></label>
                  <input 
                    type="text" placeholder="Ex: João Silva" required
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm md:text-base"
                    value={form.responsavel} onChange={e => setForm({...form, responsavel: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">WhatsApp de Contato <span className="text-red-500">*</span></label>
                  <input 
                    type="text" placeholder="(00) 00000-0000" required
                    className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm md:text-base"
                    value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-6 md:mb-10">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">E-mail <span className="text-red-500">*</span></label>
                <input 
                  type="email" placeholder="seu@email.com" required
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm md:text-base"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div className="space-y-2 mb-6 md:mb-10">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Nome da Loja <span className="text-red-500">*</span></label>
                <input 
                  type="text" placeholder="Ex: Burger do João" required
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm md:text-base"
                  value={form.nomeLoja} onChange={e => setForm({...form, nomeLoja: e.target.value})}
                />
              </div>

              <div className="space-y-2 mb-6 md:mb-10">
                <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest">Endereço Completo <span className="text-red-500">*</span></label>
                <input 
                  type="text" required
                  placeholder="Ex: Av. Brasil, 1500 - Centro, Rio de Janeiro - RJ" 
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-2xl py-3 md:py-4 px-4 md:px-6 font-bold text-gray-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm md:text-base"
                  value={form.endereco} 
                  onChange={e => setForm({...form, endereco: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Identidade Visual */}
        {step === 2 && (
          <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8 md:gap-12 animate-fade-in mb-32">
            <div className="flex-1 space-y-8 md:space-y-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4 tracking-tighter leading-none">Defina a cara da sua loja</h2>
                <p className="text-base md:text-xl text-gray-400 font-medium">Essas imagens aparecerão para seus clientes no app.</p>
              </div>

              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
                <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-4 mb-6 md:mb-8">Logotipo da Loja</h3>
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                   <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                   <div onClick={() => logoInputRef.current?.click()} className="w-32 h-32 md:w-48 md:h-48 bg-gray-50 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-emerald-500 hover:text-emerald-500 cursor-pointer transition-all overflow-hidden relative">
                      {form.logo ? <img src={form.logo} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Upload</span>}
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <button onClick={() => logoInputRef.current?.click()} className="text-emerald-600 font-black text-sm hover:underline">Escolher arquivo</button>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
                <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-4 mb-6 md:mb-8">Capa / Banner</h3>
                <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
                <div onClick={() => bannerInputRef.current?.click()} className="w-full h-32 md:h-48 bg-gray-50 rounded-[1.5rem] md:rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-300 hover:border-emerald-500 cursor-pointer overflow-hidden relative">
                  {form.banner ? <img src={form.banner} alt="Banner" className="w-full h-full object-cover" /> : <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Arraste a imagem</p>}
                </div>
              </div>

              <div className="pb-12">
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tighter">Qual o seu ramo?</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {['Restaurante', 'Mercado', 'Lanches', 'Pet Shop', 'Farmácia', 'Outros'].map(cat => (
                    <button key={cat} onClick={() => setForm({...form, ramo: cat})} className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center justify-center text-center transition-all border-4 ${form.ramo === cat ? 'bg-emerald-50 border-emerald-500 shadow-xl' : 'bg-white border-transparent'}`}>
                      <span className="font-black text-gray-800 text-sm md:text-lg">{cat}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Mobile Preview - Hidden on small screens */}
            <div className="hidden lg:block w-[400px] shrink-0 sticky top-32 h-fit">
              <div className="bg-white p-6 rounded-[3.5rem] shadow-3xl border border-gray-100 relative min-h-[600px]">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-gray-900 rounded-b-3xl z-10" />
                 <div className="h-40 bg-gray-200 relative rounded-t-[2.5rem] overflow-hidden">
                    {form.banner && <img src={form.banner} className="w-full h-full object-cover" />}
                 </div>
                 <div className="px-6 -mt-8 relative z-20">
                    <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border-4 border-white overflow-hidden">
                       {form.logo ? <img src={form.logo} className="w-full h-full object-cover" /> : '🏪'}
                    </div>
                    <div className="mt-4"><h4 className="text-xl font-black text-gray-900">{form.nomeLoja || 'Sua Loja'}</h4></div>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Pagamento */}
        {step === 3 && (
          <div className="w-full max-w-5xl animate-fade-in mb-32">
             <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 md:mb-4 tracking-tighter">Escolha seu plano</h2>
                <p className="text-base md:text-xl text-gray-400 font-medium">Acesso imediato após confirmação do administrador.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
                {/* Filtrar planos privados para não aparecerem no onboarding */}
                {planos.filter(p => !p.privado).map((plan) => (
                   <div 
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border-4 cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-emerald-500 shadow-2xl scale-105 z-10' : 'border-transparent hover:border-gray-100 opacity-80 hover:opacity-100'}`}
                   >
                      {plan.destaque && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Mais Popular</div>}
                      <h3 className="text-xl font-black text-gray-900 mb-2">{plan.nome}</h3>
                      <p className="text-3xl md:text-4xl font-black text-gray-900 mb-6">{formatCurrency(plan.preco)}<span className="text-sm text-gray-400">/mês</span></p>
                      <ul className="space-y-3 mb-8">
                         <li className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <span className="text-emerald-500">✓</span> {plan.limitePedidos >= 99999 ? 'Pedidos Ilimitados' : `Até ${plan.limitePedidos} pedidos`}
                         </li>
                         <li className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <span className="text-emerald-500">✓</span> {plan.limiteEntregadores >= 999 ? 'Entregadores Ilimitados' : `Até ${plan.limiteEntregadores} entregadores`}
                         </li>
                         {plan.recursos.map((rec, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs font-bold text-gray-500">
                               <span className="text-emerald-500">✓</span> {rec}
                            </li>
                         ))}
                      </ul>
                      <div className={`w-6 h-6 rounded-full border-2 ml-auto flex items-center justify-center ${selectedPlan === plan.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-200'}`}>
                         {selectedPlan === plan.id && '✓'}
                      </div>
                   </div>
                ))}
             </div>

             <div className="bg-white p-6 md:p-8 rounded-[2rem] max-w-2xl mx-auto shadow-sm border border-gray-100 text-center">
                <h4 className="font-black text-gray-800 mb-2 text-lg">🚀 Quase lá!</h4>
                <p className="text-sm text-gray-500">
                    Ao finalizar o cadastro, sua loja entrará em modo de <strong>aprovação</strong>. 
                    Nossa equipe verificará seus dados e liberará o acesso assim que o pagamento da primeira mensalidade for confirmado.
                </p>
             </div>
          </div>
        )}

        {/* Botões de Navegação Fixed Bottom */}
        <div className="fixed bottom-0 left-0 w-full p-4 md:p-12 pointer-events-none flex justify-center z-50">
          <div className="w-full max-w-7xl flex justify-between items-center pointer-events-auto bg-white/80 backdrop-blur-md md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none border border-gray-100 md:border-none shadow-xl md:shadow-none">
            <button onClick={handleBack} className="bg-white border-2 border-gray-100 text-gray-400 px-6 md:px-10 py-3 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-sm md:text-xl hover:border-emerald-500 hover:text-emerald-700 transition-all shadow-sm active:scale-95">Voltar</button>
            <button onClick={handleNext} className="bg-emerald-600 text-white px-8 md:px-12 py-3 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black text-sm md:text-xl shadow-2xl flex items-center gap-4 hover:bg-emerald-500 transition-all transform hover:-translate-y-1 active:scale-95">
               {step === 3 ? 'Finalizar Cadastro' : 'Próximo'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
