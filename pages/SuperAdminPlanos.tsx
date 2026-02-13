
import React from 'react';
import { useStore } from '../store';
import { formatCurrency } from '../utils';

export const SuperAdminPlanos = () => {
  const { planos } = useStore();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-gray-900">Planos & Preços</h1>
        <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-105 transition-all">NOVO PLANO</button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {planos.map(p => (
          <div key={p.id} className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-3xl font-black mb-2 text-gray-800">{p.nome}</h3>
              <p className="text-5xl font-black text-emerald-600 mb-8">{formatCurrency(p.preco)}<span className="text-sm text-gray-400">/mês</span></p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3 text-gray-600 font-medium">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Até {p.limitePedidos} pedidos
                </li>
                {p.recursos.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 font-medium">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" /> {r}
                  </li>
                ))}
              </ul>
            </div>
            
            <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black tracking-widest text-sm hover:bg-emerald-600 transition-colors">EDITAR CONFIGURAÇÕES</button>
          </div>
        ))}
      </div>
    </div>
  );
};
