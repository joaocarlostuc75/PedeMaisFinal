
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Role } from '../types';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleLogin = (role: Role = 'lojista') => {
    setUser({
      id: 'u1',
      nome: 'Ricardo (Padaria)',
      email: 'ricardo@pedemais.app',
      role
    });
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#edf1f5] flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in">
        {/* Top Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[#1a2b4b] via-[#3b82f6] to-[#059669]" />
        
        <div className="p-12">
          {/* Logo Area */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#f1f5f9] rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
            </div>
            <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">Pede Mais</h1>
            <p className="text-gray-400 text-sm font-medium mt-1">Acesso para Parceiros e Entregadores</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                <input 
                  type="email" placeholder="seu@email.com" 
                  className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 pl-12 pr-4 font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                <input 
                  type="password" placeholder="••••••••" 
                  className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl py-4 pl-12 pr-4 font-medium text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="text-right">
              <button className="text-xs font-bold text-gray-400 hover:text-[#1e293b] transition-colors uppercase tracking-widest">Esqueci minha senha</button>
            </div>

            <button 
              onClick={() => handleLogin()}
              className="w-full bg-[#112644] text-white py-4 rounded-xl font-black text-sm tracking-widest shadow-xl shadow-blue-900/10 hover:bg-[#1a3b66] transition-all transform active:scale-95"
            >
              ENTRAR
            </button>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="h-[1px] bg-gray-100 flex-1" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Novo por aqui?</span>
            <div className="h-[1px] bg-gray-100 flex-1" />
          </div>

          <Link 
            to="/onboarding"
            className="mt-10 w-full bg-white border border-gray-100 py-4 rounded-xl font-black text-[11px] tracking-widest text-gray-800 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            CRIAR MINHA LOJA
          </Link>
        </div>

        {/* Footer info */}
        <div className="bg-[#f8fafc] p-6 text-center border-t border-gray-50">
          <p className="text-[10px] text-gray-400 font-medium">© 2023 Pede Mais. Tecnologia da Amazônia para o mundo.</p>
        </div>
      </div>

      <div className="mt-8 flex gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
        <a href="#" className="hover:text-gray-600 transition-colors">Parceiros</a>
        <span>•</span>
        <a href="#" className="hover:text-gray-600 transition-colors">Entregadores</a>
        <span>•</span>
        <a href="#" className="hover:text-gray-600 transition-colors">Suporte</a>
      </div>
    </div>
  );
};
