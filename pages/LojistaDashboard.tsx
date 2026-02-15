
import React, { useMemo } from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export const LojistaDashboard = () => {
  const navigate = useNavigate();
  const { lojas, entregas, entregadores, user, systemSettings } = useStore();
  
  // Busca a loja do usuário logado ou usa a primeira como fallback (demo)
  const minhaLoja = user?.lojaId ? lojas.find(l => l.id === user.lojaId) || lojas[0] : lojas[0];
  const isDemo = user?.id === 'demo-user';

  // --- LÓGICA DE BLOQUEIO PARA CONTA PENDENTE ---
  if (minhaLoja.statusAssinatura === 'pendente') {
      return (
          <div className="max-w-4xl mx-auto pt-20 pb-20 px-6 text-center animate-fade-in font-sans">
              <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />
                  
                  <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-pulse">
                      ⏳
                  </div>
                  
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">Conta em Análise</h1>
                  <p className="text-lg text-gray-500 font-medium max-w-xl mx-auto leading-relaxed mb-8">
                      Olá, <strong>{user?.nome}</strong>! Sua loja <strong>{minhaLoja.nome}</strong> foi criada com sucesso, mas o acesso completo está aguardando liberação administrativa.
                  </p>

                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-200 max-w-lg mx-auto mb-10 text-left">
                      <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Próximos Passos:</h3>
                      <ul className="space-y-4">
                          <li className="flex items-start gap-4">
                              <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">1</span>
                              <p className="text-sm text-gray-600">Realize o pagamento da primeira mensalidade através da Chave PIX abaixo.</p>
                          </li>
                          <li className="flex items-start gap-4">
                              <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">2</span>
                              <p className="text-sm text-gray-600">Envie o comprovante para nosso WhatsApp de Suporte.</p>
                          </li>
                          <li className="flex items-start gap-4">
                              <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">3</span>
                              <p className="text-sm text-gray-600">Após validação (até 24h), seu painel será liberado automaticamente.</p>
                          </li>
                      </ul>
                  </div>

                  <div className="flex flex-col md:flex-row justify-center gap-6">
                      <div className="bg-gray-900 text-white p-6 rounded-2xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Chave PIX</p>
                          <p className="text-lg font-mono font-bold select-all">{systemSettings.pixKey || 'financeiro@pedemais.app'}</p>
                      </div>
                      <a 
                        href={`https://wa.me/${systemSettings.supportPhone.replace(/\D/g,'')}?text=Olá, acabei de cadastrar a loja ${minhaLoja.nome} e gostaria de ativar minha conta.`}
                        target="_blank"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 transition-all"
                      >
                          Enviar Comprovante
                      </a>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-gray-100">
                      <button onClick={() => navigate('/')} className="text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-gray-600">Voltar para Home</button>
                  </div>
              </div>
          </div>
      );
  }

  // --- CÁLCULOS ESTRATÉGICOS (Código existente para dashboard ATIVO) ---

  // 1. Dados Básicos de Hoje
  const hoje = new Date().toDateString();
  const pedidosHoje = entregas.filter(e => new Date(e.data).toDateString() === hoje && e.lojaId === minhaLoja.id);
  const faturamentoHoje = pedidosHoje.reduce((acc, curr) => acc + curr.valor, 0);
  const entregadoresOnline = entregadores.filter(e => e.lojaId === minhaLoja.id && e.status === 'disponível').length;

  // 2. Processamento de Clientes e Itens (Armazenamento de dados do cliente)
  const { clientesUnicos, topProdutos, topClientes } = useMemo(() => {
    const clientesMap = new Map();
    const produtosMap = new Map();

    const entregasDaLoja = entregas.filter(e => e.lojaId === minhaLoja.id);

    entregasDaLoja.forEach(pedido => {
        // Processar Cliente
        if (!clientesMap.has(pedido.clienteNome)) {
            clientesMap.set(pedido.clienteNome, {
                nome: pedido.clienteNome,
                totalGasto: 0,
                qtdPedidos: 0,
                ultimosItens: [], // Armazena os itens para referência
                ultimaData: pedido.data
            });
        }
        
        const cliente = clientesMap.get(pedido.clienteNome);
        cliente.totalGasto += pedido.valor;
        cliente.qtdPedidos += 1;
        // Atualiza últimos itens se o pedido for mais recente
        if (new Date(pedido.data) >= new Date(cliente.ultimaData)) {
            cliente.ultimosItens = pedido.itens.map((i: any) => i.nome);
            cliente.ultimaData = pedido.data;
        }

        // Processar Produtos
        pedido.itens.forEach((item: any) => {
            produtosMap.set(item.nome, (produtosMap.get(item.nome) || 0) + item.qtd);
        });
    });

    // Ordenar Top Produtos
    const sortedProdutos = Array.from(produtosMap.entries())
        .map(([name, qtd]) => ({ name, qtd }))
        .sort((a, b) => b.qtd - a.qtd)
        .slice(0, 5); // Top 5

    // Ordenar Top Clientes (LTV)
    const sortedClientes = Array.from(clientesMap.values())
        .sort((a, b) => b.totalGasto - a.totalGasto)
        .slice(0, 5); // Top 5

    return {
        clientesUnicos: clientesMap.size,
        topProdutos: sortedProdutos,
        topClientes: sortedClientes
    };
  }, [entregas, minhaLoja.id]);

  const stats = [
    { label: 'Pedidos Hoje', value: pedidosHoje.length.toString(), icon: '📦', color: 'bg-blue-100 text-blue-600' },
    { label: 'Faturamento Hoje', value: formatCurrency(faturamentoHoje), icon: '💰', color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Base de Clientes', value: clientesUnicos.toString(), icon: '👥', color: 'bg-purple-100 text-purple-600' },
    { label: 'Entregadores Online', value: entregadoresOnline.toString(), icon: '🛵', color: 'bg-amber-100 text-amber-600' },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  return (
    <div className="max-w-7xl mx-auto w-full pb-20 animate-fade-in">
      
      {/* Banner Modo Demo */}
      {isDemo && (
        <div className="bg-gray-900 rounded-[2rem] p-8 mb-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-[120px] opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-amber-500 text-gray-900 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20">
                        <span>🚧</span> Ambiente de Simulação
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter leading-tight">
                        Painel de Controle <span className="text-emerald-400">Pede Mais.</span>
                    </h2>
                    <p className="text-gray-400 font-medium text-sm md:text-base leading-relaxed">
                        Visualize seus KPIs, gerencie pedidos em tempo real e analise o comportamento dos seus clientes.
                    </p>
                </div>
            </div>
        </div>
      )}

      <header className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900">Painel do Lojista</h1>
        <p className="text-gray-500 mt-2 text-sm md:text-base">Bem-vindo à gestão da sua loja: <span className="font-bold text-emerald-600 block md:inline">{minhaLoja.nome}</span></p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center text-2xl mb-4`}>
              {s.icon}
            </div>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
            <h3 className="text-2xl md:text-3xl font-black text-gray-800">{s.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Pedidos Recentes */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg md:text-xl font-black text-gray-900">Pedidos Recentes</h3>
                <Link to="/admin/pedidos" className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:underline">Ver todos</Link>
            </div>
            <div className="space-y-4">
              {pedidosHoje.slice(0, 3).length > 0 ? pedidosHoje.slice(0, 3).map((pedido, idx) => (
                <div key={pedido.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100 gap-3">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-400 text-xs md:text-sm">#{pedido.id.slice(-4)}</div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm md:text-base">{pedido.clienteNome}</p>
                      <p className="text-[10px] md:text-xs text-gray-400">Há {Math.floor((new Date().getTime() - new Date(pedido.data).getTime()) / 60000)} minutos</p>
                    </div>
                  </div>
                  <div className="text-right w-full sm:w-auto flex justify-between sm:block items-center">
                    <p className="font-black text-emerald-600 text-sm md:text-base">{formatCurrency(pedido.valor)}</p>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase sm:mt-1 inline-block">{pedido.status}</span>
                  </div>
                </div>
              )) : (
                 <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-300 text-4xl mb-3">📭</p>
                    <p className="text-gray-400 text-sm font-bold">Nenhum pedido hoje ainda.</p>
                    <p className="text-gray-300 text-xs mt-1">Compartilhe seu link para começar a vender!</p>
                 </div>
              )}
            </div>
          </div>
        </div>

        {/* Link na Bio e Atalhos */}
        <div className="space-y-8">
          <div className="bg-[#112644] text-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20" />
            <h3 className="text-lg md:text-xl font-black mb-4 relative z-10">Seu Link na Bio</h3>
            <p className="text-blue-200 text-sm mb-6 relative z-10">Compartilhe o link da sua loja nas redes sociais para converter mais vendas.</p>
            <div className="bg-white/10 p-4 rounded-2xl mb-6 font-mono text-xs md:text-sm break-all border border-white/10 relative z-10">
              pedemais.app/loja/{minhaLoja.slug}
            </div>
            <Link 
              to={`/loja/${minhaLoja.slug}`} 
              target="_blank"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-center py-4 rounded-xl font-black transition-colors text-sm uppercase tracking-widest relative z-10 shadow-lg"
            >
              VISUALIZAR LOJA
            </Link>
          </div>

          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-black mb-4">Atalhos Rápidos</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/admin/entregadores" className="bg-gray-50 p-4 rounded-2xl text-center hover:bg-emerald-50 hover:text-emerald-700 transition-colors group">
                <span className="block text-2xl mb-2 group-hover:scale-110 transition-transform">🛵</span>
                <span className="text-xs font-bold text-gray-600 uppercase group-hover:text-emerald-700">Frota</span>
              </Link>
              <Link to="/admin/configuracoes" className="bg-gray-50 p-4 rounded-2xl text-center hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                <span className="block text-2xl mb-2 group-hover:scale-110 transition-transform">⚙️</span>
                <span className="text-xs font-bold text-gray-600 uppercase group-hover:text-blue-700">Config</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- NOVA SEÇÃO: INTELIGÊNCIA DE VENDAS (Charts) --- */}
      <div className="grid lg:grid-cols-2 gap-8">
          {/* Card: Produtos Mais Pedidos */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">🔥</span> Itens Mais Pedidos
              </h3>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topProdutos} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                          <Bar dataKey="qtd" fill="#10b981" radius={[0, 10, 10, 0]} barSize={20}>
                            {topProdutos.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-4 text-center uppercase tracking-widest">Baseado em todo o histórico</p>
          </div>

          {/* Card: Top Clientes & Preferências */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">👑</span> Top Clientes & Preferências
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                  {topClientes.length > 0 ? topClientes.map((cliente, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-emerald-50 hover:border-emerald-200 transition-all">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-200 text-gray-500'}`}>
                              {idx + 1}º
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-1">
                                  <h4 className="font-black text-gray-800 text-sm truncate">{cliente.nome}</h4>
                                  <span className="text-emerald-600 font-black text-xs">{formatCurrency(cliente.totalGasto)}</span>
                              </div>
                              <div className="text-[10px] text-gray-500 leading-tight">
                                  <span className="font-bold uppercase tracking-widest text-gray-400">Favoritos: </span>
                                  {cliente.ultimosItens.slice(0, 2).join(', ')}
                                  {cliente.ultimosItens.length > 2 && '...'}
                              </div>
                          </div>
                      </div>
                  )) : (
                      <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase">
                          Ainda não há dados suficientes de clientes.
                      </div>
                  )}
              </div>
              <button onClick={() => navigate('/admin/relatorio')} className="mt-6 w-full py-3 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                  Ver Relatório Completo
              </button>
          </div>
      </div>

    </div>
  );
};
