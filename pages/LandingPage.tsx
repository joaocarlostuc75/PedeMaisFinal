
import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../utils';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { SEO } from '../components/SEO';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { setUser, resetDemoStore, planos } = useStore();
  const [ticket, setTicket] = useState(75);
  const [pedidos, setPedidos] = useState(500);
  const [email, setEmail] = useState('');

  // Filtra apenas planos públicos para exibição
  const planosPublicos = useMemo(() => planos.filter(p => !p.privado), [planos]);

  const roiExtra = useMemo(() => {
    return pedidos * ticket * 0.27;
  }, [ticket, pedidos]);

  const handleDemoAccess = () => {
    resetDemoStore();
    setUser({
        id: 'demo-user',
        nome: 'Visitante (Demo)',
        email: 'demo@pedemais.app',
        role: 'lojista',
        lojaId: 'l1'
    });
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <SEO 
        title="Pede Mais - Seu Delivery Próprio Sem Taxas" 
        description="Tenha seu próprio aplicativo de delivery e pare de pagar taxas abusivas. Cardápio digital, gestão de entregadores e pagamentos online."
      />
      <nav className="p-6 md:p-8 max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl font-black text-emerald-700 tracking-tighter">PEDE MAIS</h1>
        <div className="flex items-center gap-6 font-black uppercase text-[10px] tracking-widest">
          <Link to="/login" className="bg-emerald-600 text-white px-8 py-3 rounded-2xl shadow-lg hover:scale-105 transition-all">ENTRAR</Link>
        </div>
      </nav>

      <section className="pt-20 pb-20 md:pb-32 px-6 text-center max-w-6xl mx-auto">
        <div className="inline-block bg-emerald-50 text-emerald-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">
          🚀 O MELHOR SAAS PARA DELIVERY DIRETO
        </div>
        <h1 className="text-5xl md:text-9xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-12">
          VENDA MAIS,<br/><span className="text-emerald-600">PAGUE ZERO%</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
          Tenha seu próprio cardápio digital, frota de entregadores e gestão completa sem as taxas abusivas dos marketplaces.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-6">
          <button 
            onClick={() => navigate('/onboarding')}
            className="bg-gray-900 text-white px-12 py-6 rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-emerald-600 transition-all hover:scale-105"
          >
            COMEÇAR AGORA
          </button>
          <button 
            onClick={handleDemoAccess}
            className="bg-white border-2 border-gray-100 text-gray-900 px-12 py-6 rounded-[2.5rem] font-black text-xl hover:border-emerald-500 transition-all flex items-center justify-center gap-3"
          >
            <span>VER DEMONSTRAÇÃO</span>
          </button>
        </div>
      </section>

      {/* Calculadora ROI */}
      <section className="bg-gray-50 py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-12 text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
                Pare de perder <br className="hidden lg:block"/> lucro para os <span className="text-emerald-600">Apps.</span>
              </h2>
              <div className="space-y-10">
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm text-left">
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket Médio</label>
                    <span className="font-black text-emerald-600 text-xl">{formatCurrency(ticket)}</span>
                  </div>
                  <input type="range" min="10" max="500" step="5" value={ticket} onChange={e => setTicket(Number(e.target.value))} className="w-full h-3 bg-gray-100 rounded-lg appearance-none accent-emerald-600 cursor-pointer" />
                </div>
                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm text-left">
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedidos p/ Mês</label>
                    <span className="font-black text-emerald-600 text-xl">{pedidos} pedidos</span>
                  </div>
                  <input type="range" min="10" max="2000" step="10" value={pedidos} onChange={e => setPedidos(Number(e.target.value))} className="w-full h-3 bg-gray-100 rounded-lg appearance-none accent-emerald-600 cursor-pointer" />
                </div>
              </div>
            </div>

            <div className="bg-[#064e3b] text-white rounded-[3rem] p-8 md:p-16 shadow-3xl text-center relative overflow-hidden flex flex-col justify-center items-center transform transition-all hover:scale-[1.02] duration-500">
               <div className="relative z-10 w-full">
                   <p className="text-emerald-400 font-black uppercase tracking-widest text-[10px] md:text-xs mb-6 md:mb-8">ECONOMIA MENSAL POTENCIAL</p>
                   <h3 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 md:mb-12 tracking-tighter text-white drop-shadow-md">
                     {formatCurrency(roiExtra)}
                   </h3>
                   <p className="text-emerald-100/80 font-medium text-base md:text-lg max-w-md mx-auto mb-10 md:mb-14 leading-relaxed">
                     Este é o valor que você recupera todos os meses usando nossa plataforma de canal direto.
                   </p>
                   <button 
                     onClick={() => navigate('/onboarding')} 
                     className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-5 md:py-6 rounded-[2rem] font-black text-lg md:text-xl shadow-xl shadow-emerald-900/30 transition-all active:scale-95"
                   >
                     QUERO ECONOMIZAR
                   </button>
               </div>
               
               {/* Background Glow Effect */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20 pointer-events-none" />
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400 rounded-full mix-blend-overlay filter blur-[100px] opacity-10 pointer-events-none" />
            </div>
        </div>
      </section>

      {/* Planos Section */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl font-black text-gray-900 text-center mb-16 tracking-tighter uppercase">Planos Profissionais</h2>
        <div className="grid md:grid-cols-3 gap-8">
            {planosPublicos.map(plan => (
                <div key={plan.id} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-xl transition-shadow">
                    <h3 className="text-2xl font-black text-gray-800 mb-2">{plan.nome}</h3>
                    <p className="text-4xl font-black text-emerald-600 mb-6">{formatCurrency(plan.preco)}<span className="text-sm font-bold text-gray-400">/mês</span></p>
                    <ul className="space-y-4 mb-10 text-gray-500 font-medium text-sm">
                        <li>Até {plan.limitePedidos} pedidos/mês</li>
                        <li>{plan.limiteEntregadores} entregadores</li>
                        {plan.recursos.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                    <button onClick={() => navigate('/onboarding')} className="mt-auto w-full bg-gray-900 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all">Começar Agora</button>
                </div>
            ))}
        </div>
      </section>

      <footer className="py-20 bg-white border-t border-gray-50 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-center md:text-left">
          <div className="col-span-2">
            <h1 className="text-4xl font-black text-emerald-700 tracking-tighter mb-6">PEDE MAIS</h1>
            <p className="text-gray-400 font-medium text-lg max-w-sm mx-auto md:mx-0">A solução completa de delivery para quem quer ser dono da própria operação.</p>
          </div>
          <div>
            <h5 className="font-black uppercase text-[10px] tracking-widest text-gray-900 mb-8">Transparência</h5>
            <ul className="space-y-4 font-bold text-gray-400">
              <li><Link to="/politica-privacidade" className="hover:text-emerald-600 transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos-uso" className="hover:text-emerald-600 transition-colors">Termos de Uso</Link></li>
              <li><a href="https://wa.me/5594999999999" className="hover:text-emerald-600 transition-colors">Suporte 24h</a></li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-end justify-between">
             <div className="bg-[#25D366] text-white px-8 py-4 rounded-2xl font-black shadow-lg cursor-pointer hover:scale-105 transition-transform">WHATSAPP VENDAS</div>
             <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-10">© 2024 Pede Mais Tech</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
