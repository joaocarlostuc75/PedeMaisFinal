
import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { formatCurrency, convertFileToBase64 } from '../utils';
import { Produto } from '../types';

export const LojistaProdutos = () => {
  const { produtos, addProduto, updateProduto, deleteProduto, addNotification, user, updateLoja, lojas } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduto, setEditingProduto] = useState<Partial<Produto> | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtra apenas os produtos e a loja atual
  const currentLojaId = user?.lojaId || 'l1';
  const meusProdutos = produtos.filter(p => p.lojaId === currentLojaId);
  const minhaLoja = lojas.find(l => l.id === currentLojaId);
  
  // Categorias: Default se não houver personalizadas
  const categoriasDisponiveis = minhaLoja?.categoriasCardapio && minhaLoja.categoriasCardapio.length > 0
    ? minhaLoja.categoriasCardapio
    : ['Geral', 'Lanches', 'Bebidas', 'Sobremesas'];

  const initialProduto: Partial<Produto> = {
    nome: '',
    categoria: categoriasDisponiveis[0],
    descricao: '',
    ingredientes: '', // Inicializa campo de ingredientes
    preco: 0,
    imagem: '',
    destaque: false,
    disponivel: true,
    tags: []
  };

  const handleOpenModal = (produto?: Produto) => {
    setEditingProduto(produto ? { ...produto } : initialProduto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduto(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação de tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        addNotification('error', 'A imagem deve ter no máximo 2MB.');
        return;
      }
      try {
        const base64 = await convertFileToBase64(file);
        setEditingProduto(prev => prev ? { ...prev, imagem: base64 } : null);
      } catch (error) {
        addNotification('error', 'Erro ao processar imagem.');
      }
    }
  };

  const handleSave = () => {
    if (!editingProduto?.nome || !editingProduto?.preco) {
      addNotification('error', 'Nome e preço são obrigatórios.');
      return;
    }

    const produtoData = {
        ...editingProduto,
        lojaId: currentLojaId,
        tags: Array.isArray(editingProduto.tags) ? editingProduto.tags : (typeof editingProduto.tags === 'string' ? (editingProduto.tags as string).split(',').map((t: string) => t.trim()) : [])
    } as Produto;

    if (editingProduto.id) {
      updateProduto(editingProduto.id, produtoData);
      addNotification('success', 'Produto atualizado!');
    } else {
      addProduto({
        ...produtoData,
        id: Math.random().toString(36).substr(2, 9),
      });
      addNotification('success', 'Produto cadastrado!');
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      deleteProduto(id);
      addNotification('info', 'Produto removido.');
    }
  };

  // Funções de Gestão de Categoria
  const handleAddCategory = () => {
      if (!newCategoryName.trim()) return;
      if (categoriasDisponiveis.includes(newCategoryName)) {
          addNotification('error', 'Categoria já existe.');
          return;
      }
      const newCats = [...categoriasDisponiveis, newCategoryName.trim()];
      updateLoja(currentLojaId, { categoriasCardapio: newCats });
      setNewCategoryName('');
      addNotification('success', 'Categoria adicionada!');
  };

  const handleDeleteCategory = (cat: string) => {
      if (window.confirm(`Excluir a categoria "${cat}"?`)) {
          const newCats = categoriasDisponiveis.filter(c => c !== cat);
          updateLoja(currentLojaId, { categoriasCardapio: newCats });
      }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Cardápio & Produtos</h1>
            <p className="text-gray-500 font-medium mt-1">Gerencie o que aparece na sua loja virtual.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
            >
                <span>🏷️</span> Categorias
            </button>
            <button 
                onClick={() => handleOpenModal()}
                className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2"
            >
                <span>+</span> NOVO ITEM
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {meusProdutos.map(p => (
          <div key={p.id} className={`bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all ${!p.disponivel ? 'opacity-60 grayscale' : ''}`}>
            <div className="relative aspect-[4/3] bg-gray-100">
                {p.imagem ? (
                    <img src={p.imagem} alt={p.nome} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-black text-2xl">📷</div>
                )}
                {p.destaque && (
                    <span className="absolute top-3 left-3 bg-emerald-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">Destaque</span>
                )}
            </div>
            
            <div className="p-6 flex flex-col flex-1">
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-gray-800 text-lg leading-tight">{p.nome}</h3>
                        <p className="font-black text-emerald-600 whitespace-nowrap ml-2">{formatCurrency(p.preco)}</p>
                    </div>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase rounded mb-2">{p.categoria}</span>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">{p.descricao}</p>
                </div>
                
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                    <button onClick={() => handleOpenModal(p)} className="flex-1 py-2 bg-gray-50 rounded-xl text-xs font-black text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors uppercase">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="px-3 py-2 bg-red-50 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-colors">🗑️</button>
                </div>
            </div>
          </div>
        ))}
        
        {meusProdutos.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                <span className="text-4xl block mb-4">🍽️</span>
                <h3 className="text-xl font-bold text-gray-800">Seu cardápio está vazio</h3>
                <p className="text-gray-400 text-sm mt-2 mb-6">Comece adicionando os melhores itens da sua loja.</p>
                <button onClick={() => handleOpenModal()} className="text-emerald-600 font-black uppercase text-xs hover:underline">Cadastrar primeiro item</button>
            </div>
        )}
      </div>

      {/* Modal de Gestão de Categorias */}
      {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[110] p-0 sm:p-4 animate-fade-in" onClick={() => setIsCategoryModalOpen(false)}>
              <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-md shadow-2xl p-8" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-black text-gray-900">Categorias do Cardápio</h3>
                      <button onClick={() => setIsCategoryModalOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200">✕</button>
                  </div>
                  
                  <div className="flex gap-2 mb-6">
                      <input 
                          type="text" 
                          placeholder="Nova categoria..." 
                          className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 font-bold text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500"
                          value={newCategoryName}
                          onChange={e => setNewCategoryName(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                      />
                      <button onClick={handleAddCategory} className="bg-emerald-600 text-white px-4 rounded-xl font-bold hover:bg-emerald-500">+</button>
                  </div>

                  <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2">
                      {categoriasDisponiveis.map((cat, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl group hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100">
                              <span className="font-bold text-gray-700 text-sm">{cat}</span>
                              <button onClick={() => handleDeleteCategory(cat)} className="text-gray-400 hover:text-red-500 p-1">🗑️</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Modal de Edição/Criação de Produto */}
      {isModalOpen && editingProduto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-fade-in">
            <div className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] w-full max-w-2xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900">{editingProduto.id ? 'Editar Produto' : 'Novo Produto'}</h2>
                    <button onClick={handleCloseModal} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold hover:bg-gray-200 transition-colors">✕</button>
                </div>
                
                <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Upload de Imagem */}
                        <div className="w-full md:w-1/3">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Foto do Produto</label>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:text-emerald-500 transition-all overflow-hidden relative group"
                            >
                                {editingProduto.imagem ? (
                                    <>
                                        <img src={editingProduto.imagem} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-black uppercase">Alterar</span>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-xs font-black uppercase tracking-widest text-gray-300 text-center px-4">Clique para enviar foto</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Nome do Item</label>
                                <input 
                                    type="text" 
                                    value={editingProduto.nome} 
                                    onChange={e => setEditingProduto({...editingProduto, nome: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    placeholder="Ex: X-Burguer Especial"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Preço (R$)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={editingProduto.preco} 
                                        onChange={e => setEditingProduto({...editingProduto, preco: Number(e.target.value)})}
                                        className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">De: (Promoção)</label>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={editingProduto.oldPrice || ''} 
                                        onChange={e => setEditingProduto({...editingProduto, oldPrice: Number(e.target.value)})}
                                        className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        placeholder="Opcional"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Categoria</label>
                                <select 
                                    value={editingProduto.categoria}
                                    onChange={e => setEditingProduto({...editingProduto, categoria: e.target.value})}
                                    className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                                >
                                    {categoriasDisponiveis.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Descrição Completa</label>
                        <textarea 
                            value={editingProduto.descricao} 
                            onChange={e => setEditingProduto({...editingProduto, descricao: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none h-32 resize-none"
                            placeholder="Descreva o prato..."
                        />
                    </div>

                    {/* Novo Campo: Ingredientes e Acompanhamentos */}
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Ingredientes e Acompanhamentos</label>
                        <textarea
                            value={editingProduto.ingredientes || ''}
                            onChange={e => setEditingProduto({...editingProduto, ingredientes: e.target.value})}
                            className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium text-sm text-gray-700 focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                            placeholder="Ex: Acompanha arroz, feijão, farofa e vinagrete..."
                        />
                    </div>

                    <div className="flex gap-4">
                        <div 
                            className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${editingProduto.disponivel ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 bg-gray-50'}`}
                            onClick={() => setEditingProduto({...editingProduto, disponivel: !editingProduto.disponivel})}
                        >
                            <span className="font-bold text-sm text-gray-800">Disponível para venda</span>
                            <div className={`w-10 h-6 rounded-full relative transition-colors ${editingProduto.disponivel ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-all ${editingProduto.disponivel ? 'left-5' : 'left-1'}`} />
                            </div>
                        </div>

                        <div 
                            className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${editingProduto.destaque ? 'border-orange-400 bg-orange-50' : 'border-gray-100 bg-gray-50'}`}
                            onClick={() => setEditingProduto({...editingProduto, destaque: !editingProduto.destaque})}
                        >
                            <span className="font-bold text-sm text-gray-800">Produto em Destaque</span>
                            <div className={`w-10 h-6 rounded-full relative transition-colors ${editingProduto.destaque ? 'bg-orange-400' : 'bg-gray-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md absolute top-1 transition-all ${editingProduto.destaque ? 'left-5' : 'left-1'}`} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 flex gap-4">
                    <button onClick={handleCloseModal} className="flex-1 py-4 font-black text-gray-400 uppercase tracking-widest text-xs hover:text-gray-600 transition-colors">Cancelar</button>
                    <button onClick={handleSave} className="flex-[2] bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-emerald-500 transition-colors">Salvar Produto</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
