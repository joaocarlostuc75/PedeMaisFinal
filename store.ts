
import { create } from 'zustand';
import { User, Entregador, Entrega, Loja, Plano, Saque } from './types';

interface AppState {
  user: User | null;
  lojas: Loja[];
  planos: Plano[];
  entregadores: Entregador[];
  entregas: Entrega[];
  saques: Saque[];
  setUser: (user: User | null) => void;
  addEntregador: (entregador: Entregador) => void;
  updatePlanoLoja: (lojaId: string, planoId: string) => void;
  cancelarAssinatura: (lojaId: string) => void;
  ativarPeriodoTeste: (lojaId: string) => void;
  aceitarEntrega: (entregaId: string, entregadorId: string) => void;
  finalizarEntrega: (entregaId: string) => void;
  solicitarSaque: (saque: Saque) => void;
  confirmarPagamentoSaque: (saqueId: string) => void;
  batchUpdatePlano: (lojaIds: string[], planoId: string) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  planos: [
    { id: '1', nome: 'Básico', preco: 97, limitePedidos: 100, limiteLojas: 1, recursos: ['WhatsApp Pay', 'Cardápio Digital'] },
    { id: '2', nome: 'Profissional', preco: 197, limitePedidos: 500, limiteLojas: 3, recursos: ['WhatsApp Pay', 'Cardápio Digital', 'Gestão de Entregadores'] },
    { id: '3', nome: 'Premium', preco: 297, limitePedidos: 9999, limiteLojas: 10, recursos: ['Todos os recursos', 'Suporte 24h', 'App White Label'] },
  ],
  lojas: [
    { id: 'l1', nome: 'Padaria Pão Quente', slug: 'padaria-pao-quente', planoId: '2', statusAssinatura: 'ativo', proximoVencimento: '2025-01-20', whatsapp: '5511999999999', stats: { carrinhos: 1200, finalizados: 850, mrr: 197 } },
    { id: 'l2', nome: 'Burger da Vila', slug: 'burger-da-vila', planoId: '1', statusAssinatura: 'teste', proximoVencimento: '2024-12-15', whatsapp: '5511888888888', stats: { carrinhos: 450, finalizados: 310, mrr: 0 } },
    { id: 'l3', nome: 'Sushi Master', slug: 'sushi-master', planoId: '3', statusAssinatura: 'ativo', proximoVencimento: '2025-02-10', whatsapp: '5511777777777', stats: { carrinhos: 2100, finalizados: 1950, mrr: 297 } },
  ],
  entregadores: [
    { id: 'e1', nome: 'João Motoca', telefone: '11 91234-5678', status: 'disponível', saldo: 150.50, entregasHoje: 12, entregasTotal: 145, nivel: 'Diamante', xp: 850, badges: [{id: 'b1', nome: 'Velocidade Máxima', icone: '⚡', descricao: 'Entregas em menos de 20 min'}, {id: 'b2', nome: 'Diamante', icone: '💎', descricao: 'Mais de 100 entregas concluídas'}], lojaId: 'l1' },
    { id: 'e2', nome: 'Maria Bike', telefone: '11 98765-4321', status: 'ocupado', saldo: 89.00, entregasHoje: 8, entregasTotal: 45, nivel: 'Prata', xp: 320, badges: [], lojaId: 'l1' },
    { id: 'e3', nome: 'Carlos Veloz', telefone: '11 95555-4444', status: 'disponível', saldo: 210.00, entregasHoje: 15, entregasTotal: 88, nivel: 'Ouro', xp: 610, badges: [], lojaId: 'l1' },
    { id: 'e4', nome: 'Ana Flash', telefone: '11 94444-3333', status: 'disponível', saldo: 45.00, entregasHoje: 10, entregasTotal: 22, nivel: 'Bronze', xp: 150, badges: [], lojaId: 'l1' },
    { id: 'e5', nome: 'Pedro Turbo', telefone: '11 92222-1111', status: 'disponível', saldo: 300.00, entregasHoje: 14, entregasTotal: 210, nivel: 'Diamante', xp: 980, badges: [], lojaId: 'l1' },
  ],
  entregas: [
    { id: 'ent1', pedidoId: 'ped_001', entregadorId: '', valor: 12.00, status: 'pendente', data: '2024-11-20', hora: 19 },
    { id: 'ent2', pedidoId: 'ped_002', entregadorId: 'e1', valor: 15.50, status: 'finalizada', data: '2024-11-19', hora: 12 },
    { id: 'ent3', pedidoId: 'ped_003', entregadorId: '', valor: 10.00, status: 'pendente', data: '2024-11-20', hora: 21 },
    { id: 'ent4', pedidoId: 'ped_004', entregadorId: 'e1', valor: 14.00, status: 'finalizada', data: '2024-11-20', hora: 20 },
  ],
  saques: [
    { id: 'sq1', entregadorId: 'e1', valor: 250.00, status: 'pago', data: '2024-11-15' },
    { id: 'sq2', entregadorId: 'e1', valor: 120.00, status: 'processando', data: '2024-11-20' },
  ],
  setUser: (user) => set({ user }),
  addEntregador: (ent) => set((state) => ({ entregadores: [...state.entregadores, ent] })),
  updatePlanoLoja: (lojaId, planoId) => set((state) => ({
    lojas: state.lojas.map(l => l.id === lojaId ? { ...l, planoId, statusAssinatura: 'ativo' } : l)
  })),
  cancelarAssinatura: (lojaId) => set((state) => ({
    lojas: state.lojas.map(l => l.id === lojaId ? { ...l, statusAssinatura: 'cancelado' } : l)
  })),
  ativarPeriodoTeste: (lojaId) => set((state) => ({
    lojas: state.lojas.map(l => l.id === lojaId ? { ...l, statusAssinatura: 'teste' } : l)
  })),
  aceitarEntrega: (id, eid) => set((state) => ({
    entregas: state.entregas.map(e => e.id === id ? { ...e, status: 'aceita', entregadorId: eid } : e)
  })),
  finalizarEntrega: (id) => set((state) => ({
    entregas: state.entregas.map(e => e.id === id ? { ...e, status: 'finalizada' } : e)
  })),
  solicitarSaque: (saque) => set((state) => ({ saques: [saque, ...state.saques] })),
  confirmarPagamentoSaque: (id) => set((state) => ({
    saques: state.saques.map(s => s.id === id ? { ...s, status: 'pago' } : s)
  })),
  batchUpdatePlano: (ids, pid) => set((state) => ({
    lojas: state.lojas.map(l => ids.includes(l.id) ? { ...l, planoId: pid } : l)
  })),
}));
