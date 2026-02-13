
import React, { useState } from 'react';

interface Props {
  nome: string;
  url: string;
}

export const CompartilharProduto: React.FC<Props> = ({ nome, url }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareWhatsApp = () => {
    const text = `Olha%20esse%20produto%20que%20achei%20no%20Pede%20Mais%3A%20${encodeURIComponent(nome)}%20-%20${encodeURIComponent(url)}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const copyLink = (msg?: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    if (msg) {
      alert(msg);
    }
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
        className="w-8 h-8 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full transition-all shadow-md group flex items-center justify-center border border-gray-100"
        title="Compartilhar produto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:text-emerald-600 transition-colors"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-sm shadow-2xl animate-bounce-in border border-gray-50" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-gray-900 tracking-tighter">COMPARTILHAR</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors" title="Fechar modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="space-y-4">
              <button 
                onClick={shareWhatsApp}
                className="w-full flex items-center justify-center gap-4 bg-[#25D366] hover:scale-105 active:scale-95 text-white font-black py-5 rounded-2xl shadow-lg transition-all"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.053-1.047-.057-.262-.069-.517-.149-1.512-.567-1.179-.494-1.925-1.635-1.984-1.712-.058-.077-.471-.625-.471-1.202 0-.577.301-.86.41-.977.108-.117.234-.146.312-.146.079 0 .158.001.228.004.075.003.176-.028.275.212.1.243.344.838.374.899.03.061.05.132.01.213-.04.081-.061.132-.121.203-.061.071-.128.158-.183.213-.061.061-.125.128-.054.25.071.121.315.52.676.841.465.412.857.541.978.601.121.061.192.051.264-.03.071-.081.305-.355.387-.477.082-.121.163-.101.275-.061.111.04.706.334.827.395.121.061.203.091.233.142.031.051.031.294-.112.699z"/></svg>
                WHATSAPP
              </button>
              
              <button 
                onClick={() => copyLink("Link copiado! Agora é só colar nos Stories.")}
                className="w-full flex items-center justify-center gap-4 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:scale-105 active:scale-95 text-white font-black py-5 rounded-2xl shadow-lg transition-all"
              >
                INSTAGRAM
              </button>

              <button 
                onClick={() => copyLink()}
                className="w-full flex items-center justify-center gap-4 bg-gray-50 border-2 border-gray-100 hover:border-emerald-500 text-gray-700 font-black py-5 rounded-2xl transition-all"
              >
                {copied ? "COPIADO!" : "COPIAR LINK"}
              </button>
            </div>
            
            <p className="mt-8 text-center text-[10px] text-gray-400 font-black uppercase tracking-widest">Pede Mais Compartilhamento</p>
          </div>
        </div>
      )}
    </>
  );
};
