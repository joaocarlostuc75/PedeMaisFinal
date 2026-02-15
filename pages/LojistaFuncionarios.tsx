
import React, { useState } from 'react';
import { useStore } from '../store';
import { Funcionario, FuncionarioCargo, Permissao } from '../types';
import { formatDate } from '../utils';

const ROLE_PRESETS: Record<FuncionarioCargo, Permissao[]> = {
  'Gerente': ['ver_dashboard', 'gerir_pedidos', 'gerir_cardapio', 'gerir_entregadores', 'ver_financeiro', 'configuracoes_loja'],
  'Atendente': ['gerir_pedidos', 'gerir_cardapio'],
  'Cozinha': ['gerir_pedidos'], // Visualização limitada estilo KDS
  'Entregador Fixo': ['gerir_entregadores']
};

const PERMISSIONS_LABELS: Record<Permissao, string> = {
  'ver_dashboard': 'Visualizar Dashboard',
  'gerir_pedidos': 'Gerenciar Pedidos',
  'gerir_cardapio': 'Editar Cardápio',
  'gerir_entregadores': 'Gerir Frota',
  'ver_financeiro': 'Acesso Financeiro',
  'configuracoes_loja': 'Configurações da Loja'
};

export const LojistaFuncionarios = () => {
  const { funcionarios, addFuncionario, updateFuncionario, deleteFuncionario, user, addNotification } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFunc, setEditingFunc] = useState<Partial<Funcionario> | null>(null);

  const currentLojaId = user?.lojaId || 'l1';
  const myEmployees = funcionarios.filter(f => f.lojaId === currentLojaId);

  const initialForm: Partial<Funcionario> = {
    nome: '',
    email: '',
    telefone: '',
    cargo: 'Atendente',
    ativo: true,
    permissoes: ROLE_PRESETS['Atendente']
  };

  const handleOpenModal = (func?: Funcionario) => {
    setEditingFunc(func ? { ...func } : initialForm);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingFunc?.nome || !editingFunc?.email) {
      addNotification('error', 'Nome e e-mail são obrigatórios.');
      return;
    }

    const payload = {
        ...editingFunc,
        lojaId: currentLojaId,
        id: editingFunc.id || Math.random().toString(36).substr(2, 9),
        dataCriacao: editingFunc.dataCriacao || new Date().toISOString()
    } as Funcionario;

    if (editingFunc.id) {
        updateFuncionario(editingFunc.id, payload);
        addNotification('success', 'Funcionário atualizado com sucesso.');
    } else {
        addFuncionario(payload);
        addNotification('success', 'Novo membro adicionado à equipe.');
    }
    setIsModalOpen(false);
  };

  const handleRoleChange = (cargo: FuncionarioCargo) => {
      setEditingFunc(prev => prev ? ({ ...prev, cargo, permissoes: ROLE_PRESETS[cargo] }) : null);
  };

  const togglePermission = (perm: Permissao) => {
      if (!editingFunc) return;
      const currentPerms = editingFunc.permissoes || [];
      if (currentPerms.includes(perm)) {
          setEditingFunc({ ...editingFunc, permissoes: currentPerms.filter(p => p !== perm) });
      } else {
          setEditingFunc({ ...editingFunc, permissoes: [...currentPerms, perm] });
      }
  };

  const handleDelete = (id: string) => {
      if (window.confirm('Remover este funcionário revogará o acesso dele imediatamente. Continuar?')) {
          deleteFuncionario(id);
          addNotification('info', 'Funcionário removido.');
      }
  };

  const copyInviteLink = () => {
      const dummyLink = `${window.location.origin}/invite/${currentLojaId}`;
      navigator.clipboard.writeText(dummyLink);
      addNotification('success', 'Link de convite copiado!');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Equipe & Acessos</h1>
          <p className="text-gray-500 font-medium mt-1">Gerencie quem tem acesso à sua loja e o que eles podem fazer.</p>
        </div>
        <div className="flex gap-3">
            <button onClick={copyInviteLink} className="bg-white border-2 border-emerald-100 text-emerald-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all">
                🔗 Copiar Link de Convite
            </button>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-900/10 hover:bg-emerald-600 transition-all flex items-center gap-2"
            >
                <span>+</span> Adicionar Membro
            </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myEmployees.map(func => (
            <div key={func.id} className={`bg-white p-8 rounded-[2.5rem] border transition-all hover:shadow-xl group relative ${func.ativo ? 'border-gray-100' : 'border-gray-100 opacity-60 grayscale'}`}>
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-xl font-black text-gray-400 uppercase">
                            {func.nome.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 text-lg leading-tight">{func.nome}</h3>
                            <p className="text-xs font-bold text-gray-400">{func.cargo}</p>
                        </div>
                    </div>
                    <div className="relative">
                        <button onClick={() => handleOpenModal(func)} className="text-gray-300 hover:text-emerald-500 p-2 transition-colors">⚙️</button>
                    </div>
                </div>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span>📧</span> {func.email}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <span>📱</span> {func.telefone || 'Sem telefone'}
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2">Permissões Ativas</p>
                    <div className="flex flex-wrap gap-1">
                        {func.permissoes.slice(0, 3).map(p => (
                            <span key={p} className="bg-gray-50 text-gray-500 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide border border-gray-100">
                                {PERMISSIONS_LABELS[p].split(' ')[0]}
                            </span>
                        ))}
                        {func.permissoes.length > 3 && (
                            <span className="bg-gray-50 text-gray-400 px-2 py-1 rounded-lg text-[9px] font-bold">+ {func.permissoes.length - 3}</span>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-dashed border-gray-100 flex gap-3">
                    <button 
                        onClick={() => updateFuncionario(func.id, { ativo: !func.ativo })}
                        className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${func.ativo ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    >
                        {func.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    <button 
                        onClick={() => handleDelete(func.id)}
                        className="w-12 bg-red-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                        ✕
                    </button>
                </div>
            </div>
        ))}

        {myEmployees.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <span className="text-4xl block mb-4">👔</span>
                <h3 className="text-xl font-bold text-gray-800">Sua equipe está vazia</h3>
                <p className="text-gray-400 text-sm mt-2 mb-6">Adicione funcionários para ajudar na gestão da loja.</p>
                <button onClick={() => handleOpenModal()} className="text-emerald-600 font-black uppercase text-xs hover:underline">Adicionar Primeiro Membro</button>
            </div>
        )}
      </div>

      {/* Modal de Edição/Criação */}
      {isModalOpen && editingFunc && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingFunc.id ? 'Editar Acesso' : 'Novo Membro'}</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Defina o cargo e as permissões</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold hover:bg-gray-100">✕</button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                    {/* Dados Básicos */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                            <input 
                                type="text" 
                                value={editingFunc.nome}
                                onChange={e => setEditingFunc({...editingFunc, nome: e.target.value})}
                                className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                placeholder="Ex: Maria Silva"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cargo / Função</label>
                            <select 
                                value={editingFunc.cargo}
                                onChange={e => handleRoleChange(e.target.value as FuncionarioCargo)}
                                className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 font-bold text-gray-800 outline-none appearance-none cursor-pointer hover:bg-gray-100"
                            >
                                {Object.keys(ROLE_PRESETS).map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail de Acesso</label>
                            <input 
                                type="email" 
                                value={editingFunc.email}
                                onChange={e => setEditingFunc({...editingFunc, email: e.target.value})}
                                className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                placeholder="maria@loja.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp (Opcional)</label>
                            <input 
                                type="text" 
                                value={editingFunc.telefone}
                                onChange={e => setEditingFunc({...editingFunc, telefone: e.target.value})}
                                className="w-full bg-[#f8fafc] border border-gray-100 rounded-xl p-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500/20"
                                placeholder="(00) 00000-0000"
                            />
                        </div>
                    </div>

                    {/* Permissões */}
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h4 className="font-black text-gray-800 text-sm mb-4 flex items-center gap-2">
                            🔐 Permissões de Acesso
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[9px] uppercase font-black">Personalizável</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(Object.keys(PERMISSIONS_LABELS) as Permissao[]).map(perm => (
                                <label key={perm} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-emerald-500 transition-all select-none">
                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${editingFunc.permissoes?.includes(perm) ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                        {editingFunc.permissoes?.includes(perm) && <span className="text-white text-xs font-bold">✓</span>}
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={editingFunc.permissoes?.includes(perm)}
                                        onChange={() => togglePermission(perm)}
                                        className="hidden"
                                    />
                                    <span className={`text-xs font-bold ${editingFunc.permissoes?.includes(perm) ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {PERMISSIONS_LABELS[perm]}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white flex gap-4">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-xs hover:bg-gray-50 rounded-xl transition-all">Cancelar</button>
                    <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-900/10 hover:bg-emerald-500 transition-all">
                        {editingFunc.id ? 'Salvar Alterações' : 'Criar Acesso'}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
