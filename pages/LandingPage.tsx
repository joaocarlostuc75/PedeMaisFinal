
import React, { useState, useMemo } from 'react';
import { formatCurrency } from '../utils';
import { Link, useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(75);
  const [pedidos, setPedidos] = useState(500);
  const [email, setEmail] = useState('');

  const roiExtra = useMemo(() => {
    return pedidos * ticket * 0.27;
  }, [ticket, pedidos]);

  const cases = [
    { nome: "Padaria Pão Quente", crescimento: "40%", cidade: "São Paulo, SP", logo: "🥖" },
    { nome: "Burger da Vila", crescimento: "65%", cidade: "Curitiba, PR", logo: "🍔" },
    { nome: "Sushi Master", crescimento: "30%", cidade: "Rio de Janeiro, RJ", logo: "🍣" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <nav className="p-6 md:p-8 max-w-7xl mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <h1 className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tighter">PEDE MAIS</h1>
        <div className="flex items-center gap-4 md:gap-8 font-black uppercase text-[10px] tracking-widest">
          <a href="#calculadora" className="hidden md:block text-gray-400 hover:text-emerald-600 transition-colors">Calculadora</a>
          <a href="#cases" className="hidden md:block text-gray-400 hover:text-emerald-600 transition-colors">Cases</a>
          <Link to="/login" className="bg-emerald-600 text-white px-5 py-2.5 md:px-8 md:py-3 rounded-2xl shadow-lg shadow-emerald-100 hover:scale-105 transition-all">ENTRAR</Link>
        </div>
      </nav>

      <section className="pt-16 pb-20 md:pt-24 md:pb-40 px-6 text-center max-w-6xl mx-auto">
        <div className="inline-block bg-emerald-50 text-emerald-700 px-4 py-2 md:px-6 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest mb-8 md:mb-10 animate-pulse">
          🚀 O MELHOR SAAS PARA DELIVERY DIRETO
        </div>
        <h1 className="text-5xl sm:text-7xl md:text-9xl font-black text-gray-900 leading-[0.9] tracking-tighter mb-8 md:mb-12">
          VENDA MAIS,<br/><span className="text-emerald-600">PAGUE ZERO%</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10 md:mb-16 font-medium leading-relaxed">
          Recupere seu lucro. Tenha seu próprio cardápio digital, frota de entregadores e gestão completa sem as taxas abusivas dos marketplaces.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6">
          <button 
            onClick={() => navigate('/onboarding')}
            className="bg-gray-900 text-white px-8 py-5 md:px-12 md:py-6 rounded-[2rem] md:rounded-[2.5rem] font-black text-lg md:text-2xl shadow-2xl hover:bg-emerald-600 transition-all hover:scale-105"
          >
            COMEÇAR AGORA
          </button>
          <button 
            onClick={() => navigate('/onboarding')}
            className="bg-white border-2 border-gray-100 text-gray-900 px-8 py-5 md:px-12 md:py-6 rounded-[2rem] md:rounded-[2.5rem] font-black text-lg md:text-2xl hover:border-emerald-500 transition-all"
          >
            VER DEMONSTRAÇÃO
          </button>
        </div>
      </section>

      <section id="calculadora" className="bg-gray-50 py-20 md:py-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">
            <div className="space-y-8 md:space-y-12">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
                Pare de dar dinheiro <br/> para os <span className="text-emerald-600">Grandes Apps.</span>
              </h2>
              <div className="space-y-8 md:space-y-12">
                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket Médio</label>
                    <span className="font-black text-emerald-600 text-xl">{formatCurrency(ticket)}</span>
                  </div>
                  <input 
                    type="range" min="10" max="500" step="5" value={ticket}
                    onChange={(e) => setTicket(Number(e.target.value))}
                    className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
                <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm">
                  <div className="flex justify-between mb-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pedidos por Mês</label>
                    <span className="font-black text-emerald-600 text-xl">{pedidos} pedidos</span>
                  </div>
                  <input 
                    type="range" min="10" max="2000" step="10" value={pedidos}
                    onChange={(e) => setPedidos(Number(e.target.value))}
                    className="w-full h-3 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="bg-emerald-900 text-white rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 shadow-3xl text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[120px] opacity-20" />
               <p className="text-emerald-400 font-black uppercase tracking-widest text-xs mb-4 md:mb-6">ECONOMIA MENSAL POTENCIAL</p>
               <h3 className="text-5xl md:text-8xl font-black mb-8 md:mb-10 tracking-tighter">{formatCurrency(roiExtra)}</h3>
               <p className="text-emerald-100/60 font-medium text-base md:text-lg leading-relaxed">
                 Este é o valor que você está perdendo em comissões todos os meses. <br/> No Pede Mais, esse lucro é 100% seu.
               </p>
               <button 
                onClick={() => navigate('/onboarding')}
                className="mt-8 md:mt-12 w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-xl shadow-xl transition-all"
               >
                  QUERO ECONOMIZAR AGORA
               </button>
            </div>
          </div>
        </div>
      </section>

      <section id="cases" className="py-20 md:py-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-12 md:mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">Quem usa, <span className="text-emerald-600">vende mais.</span></h2>
        </div>
        <div className="flex gap-6 md:gap-8 px-6 animate-scroll whitespace-nowrap">
          {[...cases, ...cases].map((c, i) => (
            <div key={i} className="inline-block bg-white border border-gray-100 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] shadow-sm min-w-[300px] md:min-w-[350px]">
              <div className="text-4xl md:text-5xl mb-6">{c.logo}</div>
              <h4 className="text-xl md:text-2xl font-black text-gray-900 mb-2">{c.nome}</h4>
              <p className="text-gray-400 font-bold mb-6 text-sm md:text-base">{c.cidade}</p>
              <div className="bg-emerald-50 text-emerald-700 p-4 md:p-6 rounded-2xl font-black text-sm md:text-base">
                Crescimento de <span className="text-2xl md:text-3xl block">{c.crescimento}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-900 py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6 md:mb-8">Experimente grátis por 7 dias.</h2>
          <p className="text-gray-400 text-lg md:text-xl mb-10 md:mb-12">Sem cartão de crédito, sem burocracia. Cadastre seu e-mail e comece a vender.</p>
          <form className="flex flex-col md:flex-row gap-4" onSubmit={(e) => { e.preventDefault(); navigate('/onboarding'); }}>
            <input 
              type="email" placeholder="seu@email.com" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-2 border-white/10 rounded-2xl px-6 md:px-8 py-4 md:py-5 text-white font-bold focus:border-emerald-500 outline-none transition-all"
            />
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-black text-lg md:text-xl shadow-xl transition-all">
              CRIAR MINHA LOJA
            </button>
          </form>
        </div>
      </section>

      <footer className="py-12 md:py-20 bg-white border-t border-gray-50 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h1 className="text-3xl md:text-4xl font-black text-emerald-700 tracking-tighter mb-6">PEDE MAIS</h1>
            <p className="text-gray-400 font-medium text-base md:text-lg max-w-sm">A maior plataforma de canais diretos do Brasil. Tecnologia de ponta para o pequeno e médio varejista.</p>
          </div>
          <div>
            <h5 className="font-black uppercase text-[10px] tracking-widest text-gray-900 mb-6">Links Úteis</h5>
            <ul className="space-y-4 font-bold text-gray-400">
              <li><a href="#" className="hover:text-emerald-600">Planos</a></li>
              <li><a href="#" className="hover:text-emerald-600">Vendas</a></li>
              <li><a href="#" className="hover:text-emerald-600">Suporte</a></li>
            </ul>
          </div>
          <div className="flex flex-col items-start md:items-end justify-between">
            <a href="https://wa.me/5511999999999?text=Quero%20vender%20no%20Pede%20Mais" target="_blank" className="flex items-center gap-4 bg-[#25D366] text-white px-6 md:px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all w-full md:w-auto justify-center">
               <span>FALE COM VENDAS</span>
               <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.047-.057-.262-.069-.517-.149-1.512-.567-1.179-.494-1.925-1.635-1.984-1.712-.058-.077-.471-.625-.471-1.202 0-.577.301-.86.41-.977.108-.117.234-.146.312-.146.079 0 .158.001.228.004.075.003.176-.028.275.212.1.243.344.838.374.899.03.061.05.132.01.213-.04.081-.061.132-.121.203-.061.071-.128.158-.183.213-.061.061-.125.128-.054.25.071.121.315.52.676.841.465.412.857.541.978.601.121.061.192.051.264-.03.071-.081.305-.355.387-.477.082-.121.163-.101.275-.061.111.04.706.334.827.395.121.061.203.091.233.142.031.051.031.294-.112.699z"/></svg>
            </a>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-10">© 2024 Pede Mais Tech</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
