
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store';
import { CompartilharProduto } from '../components/CompartilharProduto';
import { formatCurrency } from '../utils';
import { Produto } from '../types';

interface ProductCardProps {
  product: Produto;
  onAdd: (id: string) => void;
  isAdded: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAdd, isAdded }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  // Se 'imagens' existir e tiver conteúdo, usa ele; senão, usa 'imagem' única.
  const images = product.imagens && product.imagens.length > 0 ? product.imagens : [product.imagem];
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all">
      <div className="aspect-[4/3] relative bg-gray-50 overflow-hidden">
        <img src={images[currentImgIndex]} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={product.nome} />
        
        {/* Controles do Carrossel */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              ‹
            </button>
            <button 
              onClick={nextImage} 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${idx === currentImgIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          </>
        )}

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
           <CompartilharProduto nome={product.nome} url={window.location.href} />
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-black text-gray-800 text-lg leading-tight mb-2">{product.nome}</h3>
        <p className="text-xs text-gray-400 font-medium line-clamp-2 mb-6">{product.descricao}</p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-black text-emerald-600">{formatCurrency(product.preco)}</span>
          <button 
            onClick={() => onAdd(product.id)}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isAdded ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-emerald-600'}`}
          >
            {isAdded ? '✓ Adicionado' : '+ Comprar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PublicShop = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lojas, produtos, cart, cartLojaId, addToCart, updateCartQuantity, setCartQuantity, myOrderIds } = useStore();
  const loja = lojas.find(l => l.slug === slug);
  
  const [busca, setBusca] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  
  const [addedFeedback, setAddedFeedback] = useState<Set<string>>(new Set());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!loja) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-2">Loja não encontrada</h1>
        <button onClick={() => navigate('/')} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black">Voltar</button>
      </div>
    );
  }

  // Verifica se o carrinho atual pertence a esta loja
  const currentCartItems = cartLojaId === loja.id ? cart : [];

  const produtosDaLoja = produtos.filter(p => p.lojaId === loja.id);

  const categoriasDisponiveis = useMemo(() => {
    const cats = new Set<string>();
    produtosDaLoja.forEach(p => cats.add(p.categoria));
    return Array.from(cats).sort();
  }, [produtosDaLoja]);

  useEffect(() => {
    if (categoriasDisponiveis.length > 0 && !activeCategory) {
      setActiveCategory(categoriasDisponiveis[0]);
    }
  }, [categoriasDisponiveis]);

  // Cálculos do Carrinho
  const totalItens = useMemo(() => currentCartItems.reduce((acc, curr) => acc + curr.qtd, 0), [currentCartItems]);
  
  const subTotal = useMemo(() => currentCartItems.reduce((acc, curr) => {
    const prod = produtos.find(p => p.id === curr.produtoId);
    return acc + (prod?.preco || 0) * curr.qtd;
  }, 0), [currentCartItems, produtos]);

  const taxaEntrega = loja.taxaEntrega || 0;
  const totalValor = totalItens > 0 ? subTotal + taxaEntrega : 0;

  const handleAddToCart = (id: string) => {
    addToCart(loja.id, id);
    
    // Feedback visual
    setAddedFeedback(prev => new Set(prev).add(id));
    setTimeout(() => {
      setAddedFeedback(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1000);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    updateCartQuantity(id, delta);
  };

  const handleSetQuantity = (id: string, qtd: number) => {
    if (qtd < 1) return;
    setCartQuantity(id, qtd);
  };

  const scrollToCategory = (cat: string) => {
    setActiveCategory(cat);
    const element = document.getElementById(`cat-${cat}`);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 180;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-32 font-sans relative">
      {/* Banner & Logo */}
      <div className="relative h-56 md:h-72 w-full overflow-hidden">
        <img src={loja.banner} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-6 left-6 flex items-end gap-6 max-w-7xl mx-auto w-full px-4">
          <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-3xl p-1 shadow-2xl border-4 border-white shrink-0 overflow-hidden">
            <img src={loja.logo} className="w-full h-full object-cover rounded-2xl" />
          </div>
          <div className="mb-2">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter">{loja.nome}</h1>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">⭐ 4.8 • {loja.categoria}</p>
          </div>
        </div>
        
        {/* Botão Meus Pedidos no Banner (Mobile/Desktop) */}
        {myOrderIds.length > 0 && (
            <Link 
                to="/meus-pedidos"
                className="absolute top-6 right-6 bg-white/90 backdrop-blur-md text-gray-800 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-white transition-all z-30"
            >
                <span>📦</span> Meus Pedidos
            </Link>
        )}
      </div>

      <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all ${scrolled ? 'shadow-md py-2' : 'py-6'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input 
                type="text" placeholder="O que você procura hoje?" 
                value={busca} onChange={e => setBusca(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="flex overflow-x-auto no-scrollbar gap-2 w-full md:w-auto">
              {categoriasDisponiveis.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => scrollToCategory(cat)}
                  className={`whitespace-nowrap px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 border border-gray-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 mt-12 space-y-16">
        {categoriasDisponiveis.map(cat => {
          const prods = produtosDaLoja.filter(p => p.categoria === cat && p.nome.toLowerCase().includes(busca.toLowerCase()));
          if (prods.length === 0) return null;
          return (
            <section key={cat} id={`cat-${cat}`} className="scroll-mt-32">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                {cat} <div className="h-1 flex-1 bg-gray-100 rounded-full" />
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {prods.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={handleAddToCart} isAdded={addedFeedback.has(p.id)} />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-end animate-fade-in" onClick={() => setIsCartOpen(false)}>
          <div className="bg-white w-full md:max-w-md h-[90vh] md:h-screen md:rounded-l-[3rem] shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h2 className="text-2xl font-black text-gray-900">Sua Sacola</h2>
               <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold shadow-sm">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               {currentCartItems.length === 0 ? (
                 <div className="text-center py-20 opacity-40">
                    <span className="text-6xl block mb-4">🛒</span>
                    <p className="font-black uppercase tracking-widest text-xs">Sacola vazia</p>
                 </div>
               ) : (
                 currentCartItems.map(item => {
                   const produto = produtos.find(p => p.id === item.produtoId);
                   if (!produto) return null;
                   return (
                     <div key={item.produtoId} className="flex gap-4 group">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                           <img src={produto.imagem} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                           <div className="flex justify-between items-start mb-2">
                              <h4 className="font-black text-gray-800 text-sm leading-tight">{produto.nome}</h4>
                              <p className="font-black text-emerald-600 text-sm">{formatCurrency(produto.preco * item.qtd)}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-100">
                                 <button 
                                    onClick={() => handleUpdateQuantity(item.produtoId, -1)} 
                                    className="w-7 h-7 flex items-center justify-center font-bold text-gray-400 hover:text-emerald-600 transition-colors"
                                 >-</button>
                                 <input 
                                    type="number" 
                                    min="1" 
                                    value={item.qtd} 
                                    onChange={(e) => handleSetQuantity(item.produtoId, parseInt(e.target.value))}
                                    className="w-10 bg-transparent text-center text-xs font-black outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                 />
                                 <button 
                                    onClick={() => handleUpdateQuantity(item.produtoId, 1)} 
                                    className="w-7 h-7 flex items-center justify-center font-bold text-gray-400 hover:text-emerald-600 transition-colors"
                                 >+</button>
                              </div>
                              <button onClick={() => handleUpdateQuantity(item.produtoId, -item.qtd)} className="text-[9px] font-black text-red-400 uppercase tracking-widest">Remover</button>
                           </div>
                        </div>
                     </div>
                   );
                 })
               )}
            </div>

            <div className="p-8 border-t border-gray-100 bg-[#f8fafc]">
               <div className="space-y-2 mb-8">
                  <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Subtotal</span>
                      <span className="text-base font-bold text-gray-600">{formatCurrency(subTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Taxa de Entrega</span>
                      <span className="text-base font-bold text-gray-600">{formatCurrency(taxaEntrega)}</span>
                  </div>
                  <div className="h-px bg-gray-200 border-t border-dashed my-2"></div>
                  <div className="flex justify-between items-end">
                      <span className="text-gray-900 font-black uppercase text-[10px] tracking-widest">Total</span>
                      <span className="text-3xl font-black text-gray-900 tracking-tighter">{formatCurrency(totalValor)}</span>
                  </div>
               </div>
               
               <button 
                  onClick={() => navigate(`/checkout/${loja.slug}`)}
                  disabled={currentCartItems.length === 0}
                  className="w-full py-5 rounded-2xl bg-emerald-600 text-white font-black uppercase text-sm tracking-widest shadow-xl shadow-emerald-900/10 hover:bg-emerald-50 disabled:bg-gray-200 disabled:shadow-none transition-all active:scale-95"
               >
                  Finalizar Pedido
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Float Cart Button */}
      {totalItens > 0 && !isCartOpen && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-40 animate-bounce-in">
           <button 
              onClick={() => setIsCartOpen(true)}
              className="w-full bg-gray-900 text-white p-5 rounded-[2rem] shadow-2xl flex items-center justify-between hover:scale-105 transition-all"
           >
              <div className="flex items-center gap-4">
                 <div className="bg-emerald-500 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">{totalItens}</div>
                 <div className="text-left">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Sua Sacola</p>
                    <p className="text-xl font-black">{formatCurrency(totalValor)}</p>
                 </div>
              </div>
              <span className="text-2xl mr-2">→</span>
           </button>
        </div>
      )}
    </div>
  );
};
