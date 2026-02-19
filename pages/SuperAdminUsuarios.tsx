
import React, { useState } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

export const SuperAdminUsuarios = () => {
  const { entregadores, lojas, addNotification } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ nome: '', email: '', role: 'lojista' });

  const realEntregadores = entregadores.filter(e => e.lojaId !== 'l1');
  const staticUsers = [{ id: 'u2', nome: 'Admin System', email: 'admin@pedemais.app', role: 'super_admin', loja: '-' }];

  const allUsers = [
    ...staticUsers,
    ...realEntregadores.map(e => ({
      id: e.id,
      nome: e.nome,
      email: `${e.nome.split(' ')[0].toLowerCase()}@driver.com`,
      role: 'entregador',
      loja: lojas.find(l => l.id === e.lojaId)?.nome || '-'
    }))
  ];

  const handleCreateUser = () => {
    if(!newUser.nome || !newUser.email) {
      addNotification('error', 'Preencha todos os campos corretamente.');
      return;
    }
    addNotification('success', `Usuário ${newUser.nome} cadastrado na base de dados!`);
    setIsModalOpen(false);
    setNewUser({ nome: '', email: '', role: 'lojista' });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 md:space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase">Usuários do Sistema</h1>
          <p className="text-gray-400 font-bold mt-1 text-xs md:text-sm">Controle de acessos e permissões administrativas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
        >
          + NOVO USUÁRIO
        </button>
      </header>

      <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Mobile: Card View */}
        <div className="md:hidden p-4 space-y-4">
            {allUsers.map(u => (
                <div key={u.id} className="bg-gray-50 rounded-[1.5rem] p-5 border border-gray-100">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-black text-gray-800 text-lg">{u.nome}</h4>
                            <p className="text-xs text-gray-400 font-medium">{u.email}</p>
                        </div>
                        <button className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm text-lg">⚙️</button>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                        <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 flex-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Função</p>
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                                u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                                u.role === 'lojista' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                                {u.role.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="bg-white px-3 py-2 rounded-xl border border-gray-100 flex-1">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Vínculo</p>
                            <p className="text-xs font-bold text-gray-700 truncate">{u.loja}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Desktop: Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
              <tr>
                <th className="p-8">Identificação</th>
                <th className="p-8">Função</th>
                <th className="p-8">Vínculo</th>
                <th className="p-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-8">
                    <div className="font-black text-gray-800">{u.nome}</div>
                    <div className="text-xs text-gray-400 font-medium">{u.email}</div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'lojista' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-8 text-gray-400 font-black text-[10px] uppercase tracking-wider">{u.loja}</td>
                  <td className="p-8 text-right">
                    <button className="bg-gray-100 p-3 rounded-xl hover:bg-emerald-600 hover:text-white transition-all">⚙️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white rounded-t-[2.5rem] md:rounded-[3rem] w-full max-w-md p-6 md:p-10 shadow-2xl animate-fade-in max-h-[85vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center mb-6 md:mb-8 sticky top-0 bg-white z-10">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter">Criar Novo Acesso</h3>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">✕</button>
            </div>
            
            <div className="space-y-6 pb-8 md:pb-0">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nome Completo</label>
                <input 
                  type="text" value={newUser.nome} onChange={e => setNewUser({...newUser, nome: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="Ex: Carlos Ferreira"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">E-mail Corporativo</label>
                <input 
                  type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" 
                  placeholder="exemplo@email.com"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Nível de Acesso</label>
                <select 
                  value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 font-bold outline-none appearance-none"
                >
                  <option value="lojista">Lojista</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="entregador">Entregador</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4 pb-4 md:pb-0">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                <button onClick={handleCreateUser} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">Finalizar Cadastro</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
