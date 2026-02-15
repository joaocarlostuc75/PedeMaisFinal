
import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { SupportTicket, TicketMessage } from '../types';
import { formatDate } from '../utils';

export const SuperAdminSuporte = () => {
  const { tickets, updateTicketStatus, replyTicket, addNotification } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');

  const filteredTickets = useMemo(() => {
    let sorted = [...tickets].sort((a, b) => new Date(b.dataAtualizacao).getTime() - new Date(a.dataAtualizacao).getTime());
    if (filterStatus !== 'Todos') {
      sorted = sorted.filter(t => t.status === filterStatus);
    }
    return sorted;
  }, [tickets, filterStatus]);

  const handleReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    const newMessage: TicketMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: 'Equipe de Suporte',
      text: replyText,
      timestamp: new Date().toISOString(),
      isAdmin: true
    };

    replyTicket(selectedTicket.id, newMessage);
    
    // Se o ticket estava 'Aberto', muda para 'Em Andamento' automaticamente
    if(selectedTicket.status === 'Aberto') {
        updateTicketStatus(selectedTicket.id, 'Em Andamento');
    }

    setReplyText('');
    addNotification('success', 'Resposta enviada com sucesso!');
    // Atualiza o ticket selecionado localmente para refletir a nova mensagem no chat
    const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
    if(updatedTicket) setSelectedTicket({...updatedTicket, mensagens: [...updatedTicket.mensagens, newMessage]});
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-700 border-red-200';
      case 'Média': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Aberto': return 'bg-red-500 text-white';
      case 'Em Andamento': return 'bg-blue-500 text-white';
      case 'Resolvido': return 'bg-emerald-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 animate-fade-in pb-20">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Central de Suporte</h1>
          <p className="text-gray-500 font-bold mt-2">Gerenciamento técnico de chamados e solicitações.</p>
        </div>
        
        <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          {['Todos', 'Aberto', 'Em Andamento', 'Resolvido'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <tr>
              <th className="p-8">Loja Solicitante</th>
              <th className="p-8">Assunto & Categoria</th>
              <th className="p-8">Status</th>
              <th className="p-8">Prioridade</th>
              <th className="p-8 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredTickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-8">
                  <p className="font-black text-gray-800 text-sm">{ticket.lojaNome}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">ID: #{ticket.id.slice(-4)} • {formatDate(ticket.dataCriacao)}</p>
                </td>
                <td className="p-8">
                  <p className="font-bold text-gray-800 text-sm mb-1">{ticket.assunto}</p>
                  <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{ticket.categoria}</span>
                </td>
                <td className="p-8">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="p-8">
                  <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getPriorityColor(ticket.prioridade)}`}>
                    {ticket.prioridade}
                  </span>
                </td>
                <td className="p-8 text-right">
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                  >
                    Atender
                  </button>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
                <tr>
                    <td colSpan={5} className="p-12 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">
                        Nenhum chamado encontrado com este filtro.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Atendimento */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]">
            
            {/* Detalhes do Ticket (Esquerda) */}
            <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-100 p-8 overflow-y-auto">
                <div className="mb-8">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 ${getPriorityColor(selectedTicket.prioridade)}`}>
                        Prioridade {selectedTicket.prioridade}
                    </span>
                    <h2 className="text-xl font-black text-gray-900 leading-tight mb-2">{selectedTicket.assunto}</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loja: {selectedTicket.lojaNome}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-8 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descrição do Problema</p>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{selectedTicket.descricao}</p>
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Alterar Status</p>
                    <div className="flex flex-col gap-2">
                        {['Aberto', 'Em Andamento', 'Resolvido'].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    updateTicketStatus(selectedTicket.id, status as any);
                                    setSelectedTicket({...selectedTicket, status: status as any});
                                    addNotification('info', `Status alterado para ${status}`);
                                }}
                                className={`p-3 rounded-xl text-xs font-black uppercase tracking-widest text-left transition-all flex justify-between items-center ${selectedTicket.status === status ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
                            >
                                {status}
                                {selectedTicket.status === status && <span>✓</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat (Direita) */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="font-black text-gray-800 uppercase tracking-widest text-sm">Histórico de Mensagens</h3>
                    <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 font-bold hover:bg-gray-200 transition-colors">✕</button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#fafbfc]">
                    {selectedTicket.mensagens.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.isAdmin ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${msg.isAdmin ? 'bg-emerald-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'}`}>
                                {msg.text}
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-widest px-1">
                                {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-gray-100 bg-white">
                    <div className="relative">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Digite sua resposta técnica..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 pr-14 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none h-24"
                        />
                        <button 
                            onClick={handleReply}
                            disabled={!replyText.trim()}
                            className="absolute bottom-3 right-3 bg-gray-900 text-white p-2 rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-gray-900 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
