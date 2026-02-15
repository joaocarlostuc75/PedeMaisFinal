
import React, { useMemo } from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend, LabelList } from 'recharts';

const HORA_PEAK_MOCK = [
  { hora: '11:00', pedidos: 5 }, { hora: '12:00', pedidos: 22 }, { hora: '13:00', pedidos: 18 },
  { hora: '18:00', pedidos: 8 }, { hora: '19:00', pedidos: 35 }, { hora: '20:00', pedidos: 42 },
  { hora: '21:00', pedidos: 28 }, { hora: '22:00', pedidos: 12 },
];

// Fallback Mocks para visualização caso não haja dados suficientes
const MOCK_PRODUTOS_VENDIDOS = [
  { name: 'X-Bacon Artesanal', value: 145 },
  { name: 'Coca-Cola 2L', value: 98 },
  { name: 'Batata Frita G', value: 76 },
  { name: 'Pizza Calabresa', value: 54 },
  { name: 'Açaí 500ml', value: 42 },
];

const MOCK_CATEGORIAS_VENDAS = [
  { name: 'Lanches', value: 45 },
  { name: 'Bebidas', value: 25 },
  { name: 'Pizzas', value: 20 },
  { name: 'Sobremesas', value: 10 },
];

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

export const LojistaRelatorio = () => {
  const { entregas, lojas, produtos, user } = useStore();
  
  // Identifica a loja atual
  const currentLojaId = user?.lojaId || 'l1';
  const loja = lojas.find(l => l.id === currentLojaId) || lojas[0];
  
  const totalRepasse = entregas.filter(e => e.lojaId === currentLojaId && e.status === 'finalizada').reduce((acc, curr) => acc + curr.valor, 0);

  // Fallback seguro para evitar NaN
  const carrinhos = loja.stats?.carrinhos || 0;
  const finalizados = loja.stats?.finalizados || 0;

  const conversionData = [
    { name: 'Abandonados', value: Math.max(0, carrinhos - finalizados) },
    { name: 'Finalizados', value: finalizados }
  ];

  const taxaConversao = carrinhos > 0 ? (finalizados / carrinhos) * 100 : 0;

  // Cálculo de Vendas por Produto e Categoria (Dados Reais)
  const { dataProdutos, dataCategorias } = useMemo(() => {
    const prodMap = new Map<string, number>();
    const catMap = new Map<string, number>();

    const entregasLoja = entregas.filter(e => e.lojaId === currentLojaId && e.status === 'finalizada');

    entregasLoja.forEach(e => {
        e.itens.forEach(item => {
            // Conta Produto
            prodMap.set(item.nome, (prodMap.get(item.nome) || 0) + item.qtd);

            // Conta Categoria (Busca no store ou usa 'Geral')
            const produtoRef = produtos.find(p => p.nome === item.nome && p.lojaId === currentLojaId);
            const cat = produtoRef?.categoria || 'Geral';
            catMap.set(cat, (catMap.get(cat) || 0) + item.qtd);
        });
    });

    const dProd = Array.from(prodMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    const dCat = Array.from(catMap).map(([name, value]) => ({ name, value }));

    return { dataProdutos: dProd, dataCategorias: dCat };
  }, [entregas, produtos, currentLojaId]);

  // Decide se usa dados reais ou mock (apenas para ficar bonito na demo se estiver vazio)
  const chartDataProdutos = dataProdutos.length > 0 ? dataProdutos : MOCK_PRODUTOS_VENDIDOS;
  const chartDataCategorias = dataCategorias.length > 0 ? dataCategorias : MOCK_CATEGORIAS_VENDAS;

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Inteligência Logística</h1>
          <p className="text-gray-500 mt-2 font-medium">Analise picos de demanda, produtos campeões e vendas.</p>
        </div>
        <div className="bg-emerald-600 text-white px-10 py-6 rounded-[2.5rem] shadow-xl text-right">
          <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Faturamento Total</p>
          <h2 className="text-4xl font-black tracking-tighter">{formatCurrency(totalRepasse)}</h2>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Gráfico de Horários */}
        <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-2xl font-black mb-8">Fluxo de Pedidos por Hora</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HORA_PEAK_MOCK}>
                <defs>
                  <linearGradient id="colorPed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hora" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                <Area type="monotone" dataKey="pedidos" stroke="#10b981" fillOpacity={1} fill="url(#colorPed)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funil de Conversão */}
        <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-xl text-center flex flex-col justify-center">
          <h3 className="text-xl font-black mb-6 uppercase tracking-widest">Conversão do Cardápio</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={conversionData} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value" stroke="none">
                  <Cell fill="#334155" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', color: '#000'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6">
            <h4 className="text-5xl font-black text-emerald-400 tracking-tighter">
              {taxaConversao.toFixed(1)}%
            </h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Taxa de Finalização</p>
          </div>
        </div>
      </div>

      {/* Novos Gráficos: Produtos e Categorias */}
      <div className="grid lg:grid-cols-2 gap-8">
          {/* Top Produtos */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                  <span className="text-emerald-500">🏆</span> Produtos Mais Vendidos
              </h3>
              <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartDataProdutos} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={110} tick={{fontSize: 10, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={24}>
                            <LabelList dataKey="value" position="right" fill="#64748b" fontSize={10} fontWeight="bold" formatter={(val: number) => `${val}`} />
                            {chartDataProdutos.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Vendas por Categoria */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-2">
                  <span className="text-purple-500">🍕</span> Vendas por Categoria
              </h3>
              <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={chartDataCategorias}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              innerRadius={40}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={5}
                          >
                              {chartDataCategorias.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                              ))}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-widest">Histórico Detalhado</h3>
          <button className="bg-gray-50 text-gray-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all">Exportar Excel</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="p-8">Data</th>
              <th className="p-8">Cliente</th>
              <th className="p-8">Itens</th>
              <th className="p-8">Valor</th>
              <th className="p-8 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entregas.filter(e => e.lojaId === currentLojaId).map(e => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-8 text-sm font-bold text-gray-600">{formatDate(e.data)}</td>
                <td className="p-8 font-black text-gray-800">{e.clienteNome}</td>
                <td className="p-8 text-xs text-gray-500 font-medium">
                    {e.itens.map(i => `${i.qtd}x ${i.nome}`).join(', ')}
                </td>
                <td className="p-8 font-black text-emerald-600">{formatCurrency(e.valor)}</td>
                <td className="p-8 text-right">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                      e.status === 'finalizada' ? 'bg-emerald-100 text-emerald-700' : 
                      e.status === 'cancelada' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                      {e.status}
                  </span>
                </td>
              </tr>
            ))}
            {entregas.filter(e => e.lojaId === currentLojaId).length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold">Nenhum pedido registrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
