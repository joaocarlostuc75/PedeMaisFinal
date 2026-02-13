
import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis } from 'recharts';

const REVENUE_MOCK = [
  { mes: 'Ago', mrr: 12500 }, { mes: 'Set', mrr: 15800 }, { mes: 'Out', mrr: 19400 }, { mes: 'Nov', mrr: 24200 },
];

const MAP_MOCK = [
  { x: 100, y: 200, size: 400, name: 'SP' }, { x: 150, y: 250, size: 200, name: 'RJ' },
  { x: 80, y: 150, size: 150, name: 'PR' }, { x: 120, y: 100, size: 100, name: 'MG' },
];

export const SuperAdminRelatorios = () => {
  const { lojas } = useStore();
  const totalMRR = lojas.reduce((acc, curr) => acc + (curr.stats?.mrr || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-12 p-8">
      <header>
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase">Métricas da Plataforma</h1>
        <p className="text-gray-400 font-bold mt-2">Saúde do ecossistema Pede Mais.</p>
      </header>

      <div className="grid md:grid-cols-4 gap-8">
        <div className="bg-emerald-600 text-white p-10 rounded-[3rem] shadow-xl">
           <p className="text-[10px] font-black text-emerald-200 uppercase tracking-widest mb-2">Faturamento Recente (MRR)</p>
           <h2 className="text-5xl font-black tracking-tighter">{formatCurrency(totalMRR)}</h2>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Churn Rate</p>
           <h2 className="text-5xl font-black text-red-500">2.4%</h2>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">LTV Médio</p>
           <h2 className="text-5xl font-black text-emerald-600">R$ 2k</h2>
        </div>
        <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-xl text-center">
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Lojas</p>
           <h2 className="text-5xl font-black text-white">{lojas.length}</h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm">
           <h3 className="text-2xl font-black mb-10 uppercase tracking-widest">Crescimento de Receita</h3>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={REVENUE_MOCK}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="mes" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="mrr" stroke="#10b981" strokeWidth={6} dot={{r: 8, fill: '#10b981'}} />
               {/* Fix: Changed closing tag to LineChart to match opening tag and avoid "Cannot find name 'AreaChart'" error */}
               </LineChart>
             </ResponsiveContainer>
           </div>
        </section>

        <section className="bg-gray-50 p-10 rounded-[3rem] border border-gray-200 shadow-inner relative overflow-hidden">
           <h3 className="text-2xl font-black mb-10 uppercase tracking-widest">Concentração Geográfica</h3>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <ScatterChart>
                 <XAxis type="number" dataKey="x" hide />
                 <YAxis type="number" dataKey="y" hide />
                 <ZAxis type="number" dataKey="size" range={[100, 2000]} />
                 <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                 <Scatter name="Lojas" data={MAP_MOCK} fill="#10b981" />
               </ScatterChart>
             </ResponsiveContainer>
           </div>
           <p className="text-center text-[10px] font-black text-gray-300 uppercase mt-4">Simulação de densidade por estado</p>
        </section>
      </div>
    </div>
  );
};
