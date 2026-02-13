
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { CompartilharProduto } from '../components/CompartilharProduto';
import { formatCurrency } from '../utils';

const CATEGORIAS = ['Todos', 'Pães Artesanais', 'Confeitaria', 'Salgados', 'Bebidas', 'Kits'];

const MOCK_PRODUTOS = [
  { id: '1', nome: 'Pão Italiano Rústico', categoria: 'Pães Artesanais', descricao: 'Fermentação natural de 48h, casca crocante e miolo macio.', preco: 18.90, imagem: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?q=80&w=400&auto=format&fit=crop', destaque: true },
  { id: '2', nome: 'Croissant de Manteiga', categoria: 'Pães Artesanais', descricao: 'Clássico francês feito com manteiga importada.', preco: 9.50, imagem: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=400&auto=format&fit=crop', destaque: true, maisVendido: true },
  { id: '3', nome: 'Sonho de Creme', categoria: 'Confeitaria', descricao: 'Massa fofinha polvilhada com açúcar e recheio generoso.', preco: 5.00, imagem: 'https://images.unsplash.com/photo-1559598467-f8b76c8155d0?q=80&w=400&auto=format&fit=crop', destaque: true },
  { id: '4', nome: 'Café Expresso', categoria: 'Bebidas', descricao: 'Grãos selecionados 100% arábica.', preco: 4.50, imagem: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?q=80&w=400&auto=format&fit=crop', destaque: true },
  { id: '5', nome: 'Torta de Morango', categoria: 'Confeitaria', descricao: 'Fatia individual com creme patissière.', preco: 14.00, imagem: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?q=80&w=400&auto=format&fit=crop', destaque: true },
  { id: '6', nome: 'Pão de Queijo (6un)', categoria: 'Salgados', descricao: 'Tradicional receita mineira com queijo canastra.', preco: 10.00, imagem: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?q=80&w=400&auto=format&fit=crop', destaque: true },
];

export const PublicShop = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { lojas } = useStore();
  const loja = lojas.find(l => l.slug === slug) || lojas[0];
  
  const [busca, setBusca] = useState('');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const [carrinho, setCarrinho] = useState<{id: string, qtd: number}[]>([]);

  const totalItens = carrinho.reduce((acc, curr) => acc + curr.qtd, 0);
  const totalValor = carrinho.reduce((acc, curr) => {
    const prod = MOCK_PRODUTOS.find(p => p.id === curr.id);
    return acc + (prod?.preco || 0) * curr.qtd;
  }, 0);

  const produtosFiltrados = useMemo(() => {
    return MOCK_PRODUTOS.filter(p => {
      const bateBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       p.descricao.toLowerCase().includes(busca.toLowerCase());
      const bateCategoria = categoriaAtiva === 'Todos' || p.categoria === categoriaAtiva;
      return bateBusca && bateCategoria;
    });
  }, [busca, categoriaAtiva]);

  const addAoCarrinho = (id: string) => {
    setCarrinho(prev => {
      const exists = prev.find(i => i.id === id);
      if (exists) return prev.map(i => i.id === id ? { ...i, qtd: i.qtd + 1 } : i);
      return [...prev, { id, qtd: 1 }];
    });
  };

  const irParaCheckout = () => {
    navigate(`/checkout/${loja.slug}`);
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-32 font-sans">
      {/* Header Fixo/Topo */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center relative">
                <img src={`https://picsum.photos/100/100?random=${loja.id}`} alt="Logo" className="w-full h-auto object-cover" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{loja.nome}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-800">
                    <svg className="w-3 h-3 text-emerald-500 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    4.8
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Aberto agora</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors" title="Compartilhar">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
              </button>
              <button className="p-2.5 text-gray-400 hover:text-gray-600 transition-colors" title="Informações">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </button>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="relative group">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-emerald-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input 
              type="text" 
              placeholder="O que você procura hoje?" 
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Categorias Horizontal */}
        <div className="max-w-4xl mx-auto px-4 pb-4 overflow-x-auto no-scrollbar flex gap-2">
          {CATEGORIAS.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full text-xs font-bold transition-all border ${
                categoriaAtiva === cat 
                  ? 'bg-[#1a5a3a] text-white border-[#1a5a3a]' 
                  : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Seção Destaques */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Destaques</h2>
            <button className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest hover:underline">Ver tudo</button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {produtosFiltrados.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <img src={p.imagem} alt={p.nome} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500 min-h-full" />
                  
                  {p.maisVendido && (
                    <span className="absolute top-3 left-3 bg-[#e67e22] text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">Mais vendido</span>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    <CompartilharProduto nome={p.nome} url={window.location.href} />
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{p.nome}</h3>
                  <p className="text-[11px] text-gray-400 font-medium line-clamp-2 mb-4 flex-1">{p.descricao}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-bold text-[#1a5a3a]">{formatCurrency(p.preco)}</span>
                    <button 
                      onClick={() => addAoCarrinho(p.id)}
                      className="bg-[#1a5a3a] hover:bg-[#14472d] text-white text-[10px] font-black px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                    >
                      <span className="text-base leading-none mb-0.5">+</span>
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* CTA Sticky Botão WhatsApp / Checkout */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-40">
        <button 
          onClick={irParaCheckout}
          className="w-full bg-[#1a5a3a] text-white py-5 rounded-2xl flex items-center justify-center gap-4 shadow-2xl hover:bg-[#14472d] transition-all transform hover:-translate-y-1 active:scale-95 group"
        >
          {totalItens > 0 ? (
            <div className="flex items-center gap-3">
              <div className="bg-white text-[#1a5a3a] min-w-[24px] h-6 rounded-full px-1.5 flex items-center justify-center text-[10px] font-black">
                {totalItens}
              </div>
              <span className="font-bold text-sm uppercase">Ver Carrinho ({formatCurrency(totalValor)})</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.047-.057-.262-.069-.517-.149-1.512-.567-1.179-.494-1.925-1.635-1.984-1.712-.058-.077-.471-.625-.471-1.202 0-.577.301-.86.41-.977.108-.117.234-.146.312-.146.079 0 .158.001.228.004.075.003.176-.028.275.212.1.243.344.838.374.899.03.061.05.132.01.213-.04.081-.061.132-.121.203-.061.071-.128.158-.183.213-.061.061-.125.128-.054.25.071.121.315.52.676.841.465.412.857.541.978.601.121.061.192.051.264-.03.071-.081.305-.355.387-.477.082-.121.163-.101.275-.061.111.04.706.334.827.395.121.061.203.091.233.142.031.051.031.294-.112.699z"/></svg>
              <span className="font-bold text-sm uppercase">Fazer pedido pelo WhatsApp</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
