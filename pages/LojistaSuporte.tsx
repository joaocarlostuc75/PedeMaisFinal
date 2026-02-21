import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { SupportTicket, TicketMessage } from '../types';
import { formatDate } from '../utils';

export const LojistaSuporte = () => {
  const { tickets, user, addTicket, replyTicket, addNotification, lojas } = useStore();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  // Identifica a loja atual
  const currentLojaId = user?.lojaId || 'l1';
  const minhaLoja = lojas.find(l => l.id === currentLojaId);

  // Tickets dessa loja
  const myTickets = tickets.filter(t => t.lojaId === currentLojaId).sort((a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime());

  // Form State
  const [form, setForm] = useState({
      assunto: '',
      categoria: 'Técnico' as SupportTicket['categoria'],
      prioridade: 'Média' as SupportTicket['prioridade'],
      descricao: ''
  });

  // Abre modal automaticamente se vier de um link com state (Ex: botão da assinatura)
  useEffect(() => {
      if (location.state && (location.state as any).openNew) {
          setIsModalOpen(true);
      }
  }, [location]);

  const handleSubmit = () => {
      if (!form.assunto || !form.descricao) {
          addNotification('error', 'Preencha o assunto e a descrição.');
          return;
      }

      const newTicket: SupportTicket = {
          id: Math.random().toString(36).substr(2, 9),
          lojaId: currentLojaId,
          lojaNome: minhaLoja?.nome || 'Minha Loja',
          assunto: form.assunto,
          categoria: form.categoria,
          prioridade: form.prioridade,
          descricao: form.descricao,
          status: 'Aberto',
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
          mensagens: [{
              id: Math.random().toString(36).substr(2, 9),
              senderName: 'Lojista',
              text: form.descricao,
              timestamp: new Date().toISOString(),
              isAdmin: false
          }]
      };

      addTicket(newTicket);
      addNotification('success', 'Chamado aberto com sucesso! Acompanhe o status por aqui.');
      setIsModalOpen(false);
      setForm({ assunto: '', categoria: 'Técnico', prioridade: 'Média', descricao: '' });
  };

  const handleReply = () => {
      if (!viewTicket || !replyText.trim()) return;

      const newMessage: TicketMessage = {
          id: Math.random().toString(36).substr(2, 9),
          senderName: user?.nome || 'Lojista',
          text: replyText,
          timestamp: new Date().toISOString(),
          isAdmin: false
      };

      replyTicket(viewTicket.id, newMessage);
      setReplyText('');
      
      // Atualiza visualização local
      const updated = tickets.find(t => t.id === viewTicket.id);
      if (updated) setViewTicket({...updated, mensagens: [...updated.mensagens, newMessage]});
  };

  const getStatusStyle = (status: string) => {
      switch(status) {
          case 'Aberto': return 'bg-red-50 text-red-600 border-red-100';
          case 'Em Andamento': return 'bg-blue-50 text-blue-600 border-blue-100';
          case 'Resolvido': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
          default: return 'bg-gray-50 text-gray-600 border-gray-100';
      }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Suporte Técnico</h1>
          <p className="text-gray-500 font-medium mt-1">Precisa de ajuda? Abra um chamado e nossa equipe responderá em breve.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#112644] text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-900/10 hover:bg-[#1a3b66] transition-all flex items-center gap-3"
        >
            <span>+</span> Novo Chamado
        </button>
      </header>

      {/* Lista de Chamados */}
      <div className="grid gap-4">
          {myTickets.map(ticket => (
              <div key={ticket.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                      <div>
                          <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(ticket.status)}`}>
                                  {ticket.status}
                              </span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {formatDate(ticket.dataCriacao)}
                              </span>
                          </div>
                          <h3 className="text-xl font-black text-gray-800">{ticket.assunto}</h3>
                      </div>
                      <button 
                        onClick={() => setViewTicket(ticket)}
                        className="bg-gray-50 text-gray-600 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all self-start md:self-center"
                      >
                          Ver Detalhes
                      </button>
                  </div>
                  <div className="bg-[#f8fafc] p-4 rounded-xl text-sm text-gray-600 font-medium line-clamp-2 border border-gray-50">
                      {ticket.descricao}
                  </div>
              </div>
          ))}

          {myTickets.length === 0 && (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                  <span className="text-4xl block mb-4">🎧</span>
                  <h3 className="text-xl font-bold text-gray-800">Nenhum chamado aberto</h3>
                  <p className="text-gray-400 text-sm mt-2 font-medium">Se tiver algum problema, estamos aqui para ajudar.</p>
              </div>
          )}
      </div>

      {/* Modal Novo Chamado */}
      {isModalOpen && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl p-8 md:p-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Novo Chamado</h2>
                      <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-200">✕</button>
                  </div>

                  <div className="space-y-6">
                      <div>
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Assunto</label>
                          <input 
                              type="text" 
                              className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
                              placeholder="Ex: Erro ao cadastrar produto"
                              value={form.assunto}
                              onChange={e => setForm({...form, assunto: e.target.value})}
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Categoria</label>
                              <select 
                                  className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 outline-none appearance-none"
                                  value={form.categoria}
                                  onChange={e => setForm({...form, categoria: e.target.value as any})}
                              >
                                  <option value="Técnico">Técnico</option>
                                  <option value="Financeiro">Financeiro</option>
                                  <option value="Comercial">Comercial</option>
                                  <option value="Outros">Outros</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Prioridade</label>
                              <select 
                                  className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-gray-800 outline-none appearance-none"
                                  value={form.prioridade}
                                  onChange={e => setForm({...form, prioridade: e.target.value as any})}
                              >
                                  <option value="Baixa">Baixa</option>
                                  <option value="Média">Média</option>
                                  <option value="Alta">Alta</option>
                              </select>
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Descrição Detalhada</label>
                          <textarea 
                              className="w-full bg-gray-50 border-none rounded-xl p-4 font-medium text-gray-700 outline-none focus:ring-2 focus:ring-emerald-500 h-32 resize-none"
                              placeholder="Descreva o problema com o máximo de detalhes possível..."
                              value={form.descricao}
                              onChange={e => setForm({...form, descricao: e.target.value})}
                          />
                      </div>

                      <button 
                          onClick={handleSubmit}
                          className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-emerald-500 transition-all"
                      >
                          Enviar Solicitação
                      </button>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {/* Modal Visualização Ticket + Chat */}
      {viewTicket && createPortal(
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl h-[80vh] flex flex-col overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                          <h3 className="font-black text-lg text-gray-900">{viewTicket.assunto}</h3>
                          <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${getStatusStyle(viewTicket.status)}`}>
                              {viewTicket.status}
                          </span>
                      </div>
                      <button onClick={() => setViewTicket(null)} className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 font-bold hover:bg-gray-100">✕</button>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
                      {viewTicket.mensagens.map((msg) => (
                          <div key={msg.id} className={`flex flex-col ${!msg.isAdmin ? 'items-end' : 'items-start'}`}>
                              <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium ${!msg.isAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-700 rounded-tl-none'}`}>
                                  {msg.text}
                              </div>
                              <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest px-1">
                                  {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                          </div>
                      ))}
                  </div>

                  {viewTicket.status !== 'Resolvido' ? (
                      <div className="p-4 border-t border-gray-100 bg-gray-50">
                          <div className="relative">
                              <textarea 
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  className="w-full bg-white border border-gray-200 rounded-2xl p-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-none h-14"
                                  placeholder="Escreva uma resposta..."
                              />
                              <button 
                                  onClick={handleReply}
                                  disabled={!replyText.trim()}
                                  className="absolute right-2 top-2 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-all"
                              >
                                  ➤
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="p-4 bg-emerald-50 text-center border-t border-emerald-100">
                          <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Este chamado foi resolvido.</p>
                      </div>
                  )}
              </div>
          </div>,
          document.body
      )}
    </div>
  );
};