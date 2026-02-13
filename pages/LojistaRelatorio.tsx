
import React from 'react';
import { useStore } from '../store';
import { formatCurrency, formatDate } from '../utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const HORA_PEAK_MOCK = [
  { hora: '11:00', pedidos: 5 }, { hora: '12:00', pedidos: 22 }, { hora: '13:00', pedidos: 18 },
  { hora: '18:00', pedidos: 8 }, { hora: '19:00', pedidos: 35 }, { hora: '20:00', pedidos: 42 },
  { hora: '21:00', pedidos: 28 }, { hora: '22:00', pedidos: 12 },
];

export const LojistaRelatorio = () => {
  const { entregas, lojas } = useStore();
  const loja = lojas[0];
  const totalRepasse = entregas.filter(e => e.status === 'finalizada').reduce((acc, curr) => acc + curr.valor, 0);

  const conversionData = [
    { name: 'Abandonados', value: loja.stats?.carrinhos! - loja.stats?.finalizados! },
    { name: 'Finalizados', value: loja.stats?.finalizados }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Inteligência Logística</h1>
          <p className="text-gray-500 mt-2 font-medium">Analise picos de demanda e taxas de conversão da sua loja.</p>
        </div>
        <div className="bg-emerald-600 text-white px-10 py-6 rounded-[2.5rem] shadow-xl text-right">
          <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-1">Repasse Pendente</p>
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
                <Tooltip />
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
                <Pie data={conversionData} innerRadius={60} outerRadius={80} paddingAngle={10} dataKey="value">
                  <Cell fill="#1e293b" />
                  <Cell fill="#10b981" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6">
            <h4 className="text-5xl font-black text-emerald-400 tracking-tighter">
              {((loja.stats?.finalizados! / loja.stats?.carrinhos!) * 100).toFixed(1)}%
            </h4>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-2">Taxa de Finalização</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-widest">Histórico de Movimentações</h3>
          <button className="bg-gray-50 text-gray-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-700 transition-all">Exportar Relatório</button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="p-8">Data</th>
              <th className="p-8">Entregador</th>
              <th className="p-8">Taxa</th>
              <th className="p-8 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {entregas.map(e => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-8 text-sm font-bold text-gray-600">{formatDate(e.data)}</td>
                <td className="p-8 font-black text-gray-800">João Motoca</td>
                <td className="p-8 font-black text-emerald-600">{formatCurrency(e.valor)}</td>
                <td className="p-8 text-right">
                  <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase">{e.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
