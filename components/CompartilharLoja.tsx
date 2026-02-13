
import React, { useState } from 'react';

interface Props {
  lojaNome: string;
  url: string;
}

export const CompartilharLoja: React.FC<Props> = ({ lojaNome, url }) => {
  const [isOpen, setIsOpen] = useState(false);

  const shareWhatsApp = () => {
    const text = `Faça seu pedido na ${encodeURIComponent(lojaNome)} pelo Pede Mais! Link: ${encodeURIComponent(url)}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-4 rounded-xl font-black transition-colors"
      >
        COMPARTILHAR LOJA
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl border border-gray-50 animate-bounce-in">
            <h3 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tighter text-center">Preview do Link</h3>
            
            {/* Simulação de Preview Visual */}
            <div className="bg-gray-50 rounded-[2.5rem] overflow-hidden border border-gray-200 mb-10 group cursor-pointer" onClick={shareWhatsApp}>
              <div className="h-40 bg-emerald-100 flex items-center justify-center text-6xl group-hover:scale-105 transition-transform">🍔</div>
              <div className="p-6">
                 <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Pede Mais Delivery</p>
                 <h4 className="text-2xl font-black text-gray-800">{lojaNome}</h4>
                 <p className="text-xs text-gray-400 font-bold mt-2">Clique aqui para ver o cardápio e fazer seu pedido direto via WhatsApp.</p>
              </div>
            </div>

            <div className="flex gap-4">
               <button onClick={shareWhatsApp} className="flex-[2] bg-[#25D366] text-white py-5 rounded-2xl font-black shadow-lg hover:scale-105 transition-all">ENVIAR WHATSAPP</button>
               <button onClick={() => setIsOpen(false)} className="flex-1 bg-gray-100 text-gray-400 py-5 rounded-2xl font-black">FECHAR</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
