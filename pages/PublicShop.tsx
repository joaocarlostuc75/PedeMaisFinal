
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { CompartilharProduto } from '../components/CompartilharProduto';
import { formatCurrency } from '../utils';

export const PublicShop = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lojas, produtos } = useStore();
  const loja = lojas.find(l => l.slug === slug);
  
  const [busca, setBusca] = useState('');
  const [activeCategory, setActiveCategory] = useState(''); // Apenas visual para a tab ativa
  
  // Carrinho agora armazena também o agendamento
  const [carrinho, setCarrinho] = useState<{id: string, qtd: number, agendamento: string}[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [addedFeedback, setAddedFeedback] = useState<Set<string>>(new Set());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Estado para o modal de descrição longa
  const [selectedProductDesc, setSelectedProductDesc] = useState<any | null>(null);

  // Efeito de scroll para o header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!loja) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
              <h1 className="text-4xl font-black text-gray-900 mb-2">Loja não encontrada</h1>
              <p className="text-gray-500 mb-8">Verifique o endereço digitado.</p>
              <button onClick={() => navigate('/')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black">Ir para Início</button>
          </div>
      )
  }

  // Filtra produtos desta loja específica
  const produtosDaLoja = produtos.filter(p => p.lojaId === loja.id);

  // Extrai categorias dinâmicas baseadas nos produtos existentes
  const categoriasDisponiveis = useMemo(() => {
      const cats = new Set<string>();
      // Adiciona categorias que têm produtos
      produtosDaLoja.forEach(p => cats.add(p.categoria));
      
      // Ordena: Destaques (se houver items com destaque) primeiro, depois alfabético
      const catsArr = Array.from(cats).sort();
      
      return catsArr;
  }, [produtosDaLoja]);

  // Define a primeira categoria como ativa inicialmente
  useEffect(() => {
      if (categoriasDisponiveis.length > 0 && !activeCategory) {
          setActiveCategory(categoriasDisponiveis[0]);
      }
  }, [categoriasDisponiveis]);

  const totalItens = carrinho.reduce((acc, curr) => acc + curr.qtd, 0);
  const totalValor = carrinho.reduce((acc, curr) => {
    const prod = produtosDaLoja.find(p => p.id === curr.id);
    return acc + (prod?.preco || 0) * curr.qtd;
  }, 0);

  const addAoCarrinho = (id: string) => {
    setCarrinho(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists) return prev.map(i => i.id === id ? { ...i, qtd: i.qtd + 1 } : i);
      return [...prev, { id, qtd: 1, agendamento: 'imediata' }]; // Default: Entrega Imediata
    });
  };

  const removeDoCarrinho = (id: string) => {
    setCarrinho(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantidade = (id: string, delta: number) => {
    setCarrinho(prev => prev.map(i => {
      if (i.id === id) {
        const newQtd = Math.max(0, i.qtd + delta);
        return { ...i, qtd: newQtd };
      }
      return i;
    }).filter(i => i.qtd > 0));
  };

  const updateAgendamento = (id: string, agendamento: string) => {
    setCarrinho(prev => prev.map(i => i.id === id ? { ...i, agendamento } : i));
  };

  const handleAddToCart = (id: string) => {
    addAoCarrinho(id);
    setAddedFeedback(prev => {
      const newSet = new Set(prev);
      newSet.add(id);
      return newSet;
    });

    setTimeout(() => {
      setAddedFeedback(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 2000);
  };

  const toggleDetails = (id: string) => {
    const newSet = new Set(expandedProducts);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedProducts(newSet);
  };

  const irParaCheckout = () => {
    navigate(`/checkout/${loja.slug}`);
  };

  const scrollToCategory = (cat: string) => {
      setActiveCategory(cat);
      const element = document.getElementById(`cat-${cat}`);
      if (element) {
          // Ajuste de offset para o header sticky (aprox 180px)
          const y = element.getBoundingClientRect().top + window.pageYOffset - 180;
          window.scrollTo({ top: y, behavior: 'smooth' });
      }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-32 font-sans relative">
      
      {/* Hero / Banner da Loja */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {loja.banner ? (
            <img 
                src={loja.banner} 
                alt="Capa da Loja" 
                className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-800 to-gray-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-10 max-w-7xl mx-auto flex items-end gap-6">
            <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-3xl p-1 shadow-2xl border-4 border-white transform translate-y-8 overflow-hidden shrink-0">
                {loja.logo ? (
                    <img src={loja.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">🏪</div>
                )}
            </div>
            <div className="mb-4 text-white flex-1">
                <h1 className="text-2xl md:text-5xl font-black tracking-tighter shadow-black drop-shadow-lg leading-tight">{loja.nome}</h1>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 text-xs md:text-sm font-medium">
                    <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md font-black uppercase text-[10px] tracking-widest">Aberto</span>
                    <span className="hidden md:inline">•</span>
                    <span>⭐ 4.9 (1.2k avaliações)</span>
                    <span>•</span>
                    <span>{loja.tempoMin}-{loja.tempoMax} min</span>
                </div>
            </div>
        </div>
      </div>

      {/* Header Sticky de Busca e Categorias */}
      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all ${scrolled ? 'shadow-md pt-2' : 'pt-12'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-4">
          
          {/* Barra de Busca e Info Rápida */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-4">
             <div className="relative group w-full md:max-w-md">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text" 
                  placeholder="Buscar no cardápio..." 
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
             </div>
             
             {/* Info de Entrega */}
             <div className="flex gap-4 text-xs font-bold text-gray-500 hidden md:flex">
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span>🛵</span>
                    <span>Entrega: {formatCurrency(loja.taxaEntrega || 5.90)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <span>💳</span>
                    <span>Pedido Mínimo: R$ 20,00</span>
                </div>
             </div>
          </div>

          {/* Categorias - Navegação Horizontal */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {categoriasDisponiveis.map(cat => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`whitespace-nowrap px-6 py-2.5 rounded-xl text-xs font-black transition-all border transform active:scale-95 flex-shrink-0 ${
                  activeCategory === cat 
                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-emerald-500 hover:text-emerald-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {categoriasDisponiveis.map(categoria => {
            // Filtra produtos da categoria E da busca
            const produtosDaCategoria = produtosDaLoja.filter(p => 
                p.categoria === categoria && 
                (p.nome.toLowerCase().includes(busca.toLowerCase()) || p.descricao.toLowerCase().includes(busca.toLowerCase()))
            );

            if (produtosDaCategoria.length === 0) return null;

            return (
                <section key={categoria} id={`cat-${categoria}`} className="mb-12 scroll-mt-48">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-6 flex items-center gap-3">
                       {categoria}
                       <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{produtosDaCategoria.length}</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {produtosDaCategoria.map(p => {
                            const isExpanded = expandedProducts.has(p.id);
                            const showSuccess = addedFeedback.has(p.id);

                            return (
                                <div key={p.id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${!p.disponivel ? 'opacity-70 grayscale' : ''}`}>
                                    {/* Imagem do Produto */}
                                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
                                        {p.imagem ? (
                                            <img 
                                                src={p.imagem} 
                                                alt={p.nome} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📷</div>
                                        )}
                                        
                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                                            {p.maisVendido && <span className="bg-[#e67e22] text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wide shadow-md">Mais vendido</span>}
                                            {p.destaque && <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wide shadow-md">Destaque</span>}
                                            {p.tags?.map(tag => (
                                                <span key={tag} className="bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wide shadow-sm border border-gray-100">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {!p.disponivel && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                                                <span className="bg-white text-gray-900 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl transform -rotate-6">Esgotado</span>
                                            </div>
                                        )}
                                        
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <CompartilharProduto nome={p.nome} url={window.location.href} />
                                        </div>
                                    </div>
                                    
                                    {/* Conteúdo */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <div className="mb-1 flex justify-between items-start gap-2">
                                            <h3 className="text-base font-black text-gray-900 leading-tight">{p.nome}</h3>
                                            {p.oldPrice && (
                                                <span className="text-[10px] text-gray-400 line-through font-bold mt-1">{formatCurrency(p.oldPrice)}</span>
                                            )}
                                        </div>
                                        
                                        <div className="mb-4 flex-1">
                                            {/* Lógica de exibição da descrição */}
                                            <p className={`text-[11px] text-gray-500 font-medium transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                                {p.descricao}
                                            </p>
                                            
                                            {/* Se a descrição for longa (> 100), mostra o botão 'Ver completo' que abre o modal */}
                                            {p.descricao.length > 100 ? (
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); setSelectedProductDesc(p); }}
                                                    className="mt-1 text-[10px] font-black uppercase text-gray-300 hover:text-emerald-600 transition-colors flex items-center gap-1"
                                                >
                                                    Ver completo 
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                                                </button>
                                            ) : p.descricao.length > 60 && (
                                                /* Se a descrição for média (entre 60 e 100), mantém a expansão inline */
                                                <button 
                                                    onClick={(e) => { e.preventDefault(); toggleDetails(p.id); }}
                                                    className="mt-1 text-[10px] font-black uppercase text-gray-300 hover:text-emerald-600 transition-colors"
                                                >
                                                    {isExpanded ? 'Ler menos' : 'Ler mais'}
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                                            <span className="text-lg font-black text-emerald-700 tracking-tight">{formatCurrency(p.preco)}</span>
                                            
                                            <button 
                                                onClick={() => p.disponivel && handleAddToCart(p.id)}
                                                disabled={!p.disponivel}
                                                className={`${
                                                !p.disponivel
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : showSuccess
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                                                    : 'bg-gray-900 hover:bg-emerald-600 text-white shadow-lg shadow-gray-900/10 active:scale-95'
                                                } text-[10px] font-black px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300`}
                                            >
                                                {!p.disponivel ? (
                                                'Indisponível'
                                                ) : showSuccess ? (
                                                <>
                                                    <svg className="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                                                    <span>Adicionado</span>
                                                </>
                                                ) : (
                                                <>
                                                    <span>Adicionar</span>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M12 5v14m7-7H5"/></svg>
                                                </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            );
        })}

        {produtosDaLoja.length === 0 && (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-6xl mb-4">🍽️</p>
                <h3 className="text-xl font-bold text-gray-800">Nenhum produto cadastrado</h3>
                <p className="text-gray-400 text-sm mt-2">Esta loja ainda não possui itens.</p>
             </div>
        )}
        
        {produtosDaLoja.length > 0 && busca && document.querySelectorAll('section').length === 0 && (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <p className="text-6xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-gray-800">Nenhum produto encontrado</h3>
                <p className="text-gray-400 text-sm mt-2">Tente buscar por outro termo.</p>
                <button onClick={() => setBusca('')} className="mt-6 text-emerald-600 font-black uppercase text-xs hover:underline">Limpar busca</button>
             </div>
        )}
      </main>

      {/* Cart Modal Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center animate-fade-in" onClick={() => setIsCartOpen(false)}>
          <div 
            className="bg-white w-full md:max-w-lg md:rounded-[2.5rem] rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fafbfc]">
               <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                 <span>🛍️</span> Sua Sacola
                 <span className="text-white bg-emerald-500 px-2 py-0.5 rounded-md text-xs">{totalItens}</span>
               </h2>
               <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 font-black hover:bg-gray-200 transition-all">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               {carrinho.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 grayscale opacity-50">🛒</div>
                    <p className="font-bold text-gray-800 text-lg">Sua sacola está vazia.</p>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto mt-2">Navegue pelo nosso cardápio recheado de delícias e faça seu pedido.</p>
                    <button onClick={() => setIsCartOpen(false)} className="mt-8 text-white bg-emerald-600 px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20">Começar a pedir</button>
                 </div>
               ) : (
                 carrinho.map(item => {
                   const produto = produtosDaLoja.find(p => p.id === item.id);
                   if (!produto) return null;
                   
                   return (
                     <div key={item.id} className="flex gap-4 border-b border-gray-50 pb-6 last:border-0 last:pb-0">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                           {produto.imagem && <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-gray-900 leading-tight pr-4 text-sm md:text-base">{produto.nome}</h4>
                              <p className="font-black text-emerald-700 text-sm whitespace-nowrap">{formatCurrency(produto.preco * item.qtd)}</p>
                           </div>
                           
                           {/* Controle de Quantidade */}
                           <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center bg-white rounded-lg p-0.5 border border-gray-200 shadow-sm">
                                    <button onClick={() => updateQuantidade(item.id, -1)} className="w-7 h-7 flex items-center justify-center font-bold text-gray-400 hover:text-emerald-600 transition-colors hover:bg-gray-50 rounded-md">-</button>
                                    <span className="w-8 text-center text-xs font-black text-gray-800">{item.qtd}</span>
                                    <button onClick={() => updateQuantidade(item.id, 1)} className="w-7 h-7 flex items-center justify-center font-bold text-gray-400 hover:text-emerald-600 transition-colors hover:bg-gray-50 rounded-md">+</button>
                                </div>
                                <button onClick={() => removeDoCarrinho(item.id)} className="text-[10px] text-red-400 font-bold hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors">Remover</button>
                           </div>

                           {/* Seletor de Agendamento */}
                           <div className="mt-3 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                              <label className="block text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                 Quando entregar?
                              </label>
                              <select 
                                value={item.agendamento}
                                onChange={(e) => updateAgendamento(item.id, e.target.value)}
                                className="w-full bg-white border border-blue-100 text-xs font-bold text-gray-700 rounded-lg py-2 px-2 outline-none focus:ring-2 focus:ring-blue-200 appearance-none cursor-pointer hover:border-blue-300 transition-colors"
                              >
                                 <option value="imediata">⚡ Entrega Imediata (30-45min)</option>
                                 <option value="hoje_tarde">📅 Hoje - Tarde (14h - 18h)</option>
                                 <option value="hoje_noite">🌙 Hoje - Noite (19h - 22h)</option>
                                 <option value="amanha_manha">☀️ Amanhã - Manhã</option>
                                 <option value="amanha_almoco">🍽️ Amanhã - Almoço</option>
                              </select>
                           </div>
                        </div>
                     </div>
                   );
                 })
               )}
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-10 pb-10 md:pb-8">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="text-lg font-bold text-gray-800">{formatCurrency(totalValor)}</span>
               </div>
               <div className="flex justify-between items-end mb-6">
                  <span className="text-gray-900 text-sm font-black uppercase tracking-widest">Total Estimado</span>
                  <span className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(totalValor)}</span>
               </div>
               <button 
                  onClick={irParaCheckout}
                  disabled={carrinho.length === 0}
                  className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-3 ${
                    carrinho.length === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-900 text-white hover:bg-emerald-600 hover:-translate-y-1 active:scale-95 shadow-emerald-900/10'
                  }`}
               >
                  <span>Ir para Pagamento</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Descrição Longa */}
      {selectedProductDesc && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedProductDesc(null)}
        >
            <div 
                className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl relative overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={() => setSelectedProductDesc(null)} 
                    className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all font-black"
                >
                    ✕
                </button>

                <div className="mb-6">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{selectedProductDesc.categoria}</p>
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">{selectedProductDesc.nome}</h3>
                </div>

                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                    <p className="text-gray-600 font-medium leading-relaxed text-sm">
                        {selectedProductDesc.descricao}
                    </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-2xl font-black text-emerald-700 tracking-tighter">{formatCurrency(selectedProductDesc.preco)}</span>
                    <button 
                         onClick={() => {
                             if(selectedProductDesc.disponivel) {
                                 handleAddToCart(selectedProductDesc.id);
                                 setSelectedProductDesc(null);
                             }
                         }}
                         disabled={!selectedProductDesc.disponivel}
                         className="bg-gray-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-gray-900/10"
                    >
                        Adicionar à Sacola
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* CTA Sticky Botão Ver Carrinho NOVO */}
      <div className={`fixed bottom-0 left-0 w-full p-4 z-40 pointer-events-none transition-transform duration-500 ease-in-out ${isCartOpen ? 'translate-y-[120%]' : 'translate-y-0'}`}>
        <div className="max-w-4xl mx-auto flex justify-center pointer-events-auto">
            {totalItens > 0 ? (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="w-full max-w-md bg-emerald-900 text-white p-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-emerald-700/50 flex items-center justify-between hover:scale-[1.02] active:scale-95 transition-all group overflow-hidden relative"
                >
                    {/* Background Shine Effect */}
                    <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shine_1.5s_infinite]" />
                    
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="bg-emerald-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner border-2 border-emerald-400">
                            {totalItens}
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-emerald-400 mb-0.5">Total estimado</span>
                            <span className="text-xl font-black leading-none tracking-tight">{formatCurrency(totalValor)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 pr-2 relative z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block text-emerald-100 group-hover:text-white transition-colors">Ver Carrinho</span>
                        <div className="w-10 h-10 bg-white text-emerald-900 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                        </div>
                    </div>
                </button>
            ) : (
                 <button
                    onClick={() => window.open(`https://wa.me/${loja.whatsapp}`, '_blank')}
                    className="w-full max-w-xs bg-white/90 backdrop-blur-md text-emerald-800 border border-emerald-100 p-4 rounded-3xl shadow-lg flex items-center justify-center gap-3 hover:bg-white transition-all transform hover:-translate-y-1"
                >
                    <svg className="w-5 h-5 fill-[#25D366]" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.047-.057-.262-.069-.517-.149-1.512-.567-1.179-.494-1.925-1.635-1.984-1.712-.058-.077-.471-.625-.471-1.202 0-.577.301-.86.41-.977.108-.117.234-.146.312-.146.079 0 .158.001.228.004.075.003.176-.028.275.212.1.243.344.838.374.899.03.061.05.132.01.213-.04.081-.061.132-.121.203-.061.071-.128.158-.183.213-.061.061-.125.128-.054.25.071.121.315.52.676.841.465.412.857.541.978.601.121.061.192.051.264-.03.071-.081.305-.355.387-.477.082-.121.163-.101.275-.061.111.04.706.334.827.395.121.061.203.091.233.142.031.051.031.294-.112.699z"/></svg>
                    <span className="font-bold text-xs uppercase tracking-widest">Falar com a loja</span>
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
