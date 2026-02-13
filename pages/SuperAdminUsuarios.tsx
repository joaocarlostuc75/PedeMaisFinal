
import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

export const SuperAdminUsuarios = () => {
  const { entregadores, lojas } = useStore();

  const users = [
    { id: 'u1', nome: 'Ricardo Dono', email: 'ricardo@pedemais.app', role: 'lojista', loja: 'Restaurante Sabor' },
    { id: 'u2', nome: 'Admin System', email: 'admin@pedemais.app', role: 'super_admin', loja: '-' },
    ...entregadores.map(e => ({
      id: e.id,
      nome: e.nome,
      email: `${e.nome.split(' ')[0].toLowerCase()}@driver.com`,
      role: 'entregador',
      loja: lojas.find(l => l.id === e.lojaId)?.nome || '-'
    }))
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Gestão de Usuários</h1>
          <p className="text-gray-400 font-bold mt-2">Controle de acesso e permissões da plataforma.</p>
        </div>
        <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all">NOVO USUÁRIO</button>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="p-8">Usuário</th>
              <th className="p-8">Email</th>
              <th className="p-8">Função</th>
              <th className="p-8">Vínculo</th>
              <th className="p-8 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-8 font-black text-gray-800">{u.nome}</td>
                <td className="p-8 text-gray-500 font-medium text-sm">{u.email}</td>
                <td className="p-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    u.role === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'lojista' ? 'bg-blue-100 text-blue-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-8 text-gray-500 font-bold text-xs">{u.loja}</td>
                <td className="p-8 text-right">
                  <button className="text-gray-400 hover:text-emerald-600 font-black text-xs uppercase transition-colors">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
