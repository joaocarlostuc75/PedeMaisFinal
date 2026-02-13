
import { create } from 'zustand';
import { User, Entregador, Entrega, Loja, Plano, Fatura, MeioPagamento, Saque, ItemPedido, Notification } from './types';

interface AppState {
  user: User | null;
  lojas: Loja[];
  planos: Plano[];
  entregadores: Entregador[];
  entregas: Entrega[];
  saques: Saque[];
  faturas: Fatura[];
  meiosPagamento: MeioPagamento[];
  notifications: Notification[];
  isSidebarOpen: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  updatePlanoLoja: (lojaId: string, planoId: string) => void;
  updateLoja: (lojaId: string, data: Partial<Loja>) => void;
  addEntregador: (entregador: any) => void;
  cancelarAssinatura: (lojaId: string) => void;
  batchUpdatePlano: (lojaIds: string[], planoId: string) => void;
  atribuirEntregador: (entregaId: string, entregadorId: string) => void; // Nova ação
  atualizarStatusPedido: (entregaId: string, novoStatus: Entrega['status']) => void;
  solicitarSaque: (saque: Saque) => void;
  
  // UI Actions
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: { id: 'u1', nome: 'Alex Morgan', email: 'admin@pedemais.app', role: 'super_admin' },
  isSidebarOpen: false,
  notifications: [],
  planos: [
    { id: '1', nome: 'Básico', preco: 99.90, limitePedidos: 500, limiteEntregadores: 5, recursos: ['WhatsApp Pay', 'Cardápio Digital', 'Suporte por e-mail'] },
    { id: '2', nome: 'Pro Amazônia', preco: 199.90, limitePedidos: 1000, limiteEntregadores: 10, recursos: ['Suporte prioritário 24/7', 'Dashboard avançado', 'IA de Roteirização'], cor: 'bg-emerald-600' },
    { id: '3', nome: 'Enterprise', preco: 499.90, limitePedidos: 99999, limiteEntregadores: 999, recursos: ['Gerente de conta dedicado', 'Integração API customizada', 'White Label total'] },
  ],
  lojas: [
    { 
      id: 'l1', 
      nome: 'Restaurante Sabor', 
      slug: 'restaurante-sabor', 
      planoId: '2', 
      statusAssinatura: 'ativo', 
      proximoVencimento: '2025-11-15', 
      whatsapp: '5511999999999',
      categoria: 'Restaurante',
      endereco: 'Av. Paulista, 1000 - Bela Vista, SP',
      taxaEntrega: 5.90,
      tempoMin: 30,
      tempoMax: 45,
      stats: { carrinhos: 1200, finalizados: 850, mrr: 199.90 } 
    },
  ],
  entregadores: [
    { id: 'e1', nome: 'Ricardo Santos', telefone: '11 91234-5678', status: 'disponível', saldo: 150.50, entregasHoje: 12, entregasTotal: 145, nivel: 'Diamante', xp: 850, badges: [], lojaId: 'l1', tipoVeiculo: 'Caminhão (Pesado)', dataAdesao: '2023-10-24' },
    { id: 'e2', nome: 'Julia Mendes', telefone: '11 98765-4321', status: 'em_pausa', saldo: 89.00, entregasHoje: 8, entregasTotal: 45, nivel: 'Prata', xp: 320, badges: [], lojaId: 'l1', tipoVeiculo: 'Moto', dataAdesao: '2023-09-12' },
    { id: 'e3', nome: 'Marcos Almeida', telefone: '11 95555-4444', status: 'suspenso', saldo: 210.00, entregasHoje: 15, entregasTotal: 88, nivel: 'Ouro', xp: 610, badges: [], lojaId: 'l1', tipoVeiculo: 'Van', dataAdesao: '2023-01-05' },
    { id: 'e4', nome: 'Carlos Vega', telefone: '11 94444-3333', status: 'disponível', saldo: 45.00, entregasHoje: 10, entregasTotal: 22, nivel: 'Bronze', xp: 150, badges: [], lojaId: 'l1', tipoVeiculo: 'Caminhão (Leve)', dataAdesao: '2023-11-15' },
    { id: 'e5', nome: 'Sarah Wilson', telefone: '11 92222-1111', status: 'disponível', saldo: 300.00, entregasHoje: 14, entregasTotal: 210, nivel: 'Diamante', xp: 980, badges: [], lojaId: 'l1', tipoVeiculo: 'Sedan', dataAdesao: '2024-02-28' },
  ],
  entregas: [
    { 
      id: 'ent1', valor: 45.90, status: 'pendente', data: new Date().toISOString(), lojaId: 'l1', clienteNome: 'Mariana Silva', endereco: 'Rua das Flores, 123',
      itens: [
        { qtd: 1, nome: 'X-Bacon Duplo', detalhe: 'Sem cebola, maionese extra', preco: 35.90 }, 
        { qtd: 1, nome: 'Coca-Cola 2L', detalhe: 'Bem gelada', preco: 10.00 }
      ]
    },
    { 
      id: 'ent2', valor: 82.50, status: 'preparando', data: new Date().toISOString(), lojaId: 'l1', clienteNome: 'Carlos Oliveira', endereco: 'Av. Paulista, 1000',
      itens: [
        { qtd: 2, nome: 'Pizza Calabresa', detalhe: 'Borda recheada de catupiry', preco: 35.00 }, 
        { qtd: 1, nome: 'Guaraná Antártica 2L', preco: 12.50 }
      ]
    },
    { 
      id: 'ent3', valor: 30.00, status: 'pronto', data: new Date().toISOString(), lojaId: 'l1', clienteNome: 'Fernanda Costa', endereco: 'Rua Augusta, 500',
      itens: [{ qtd: 1, nome: 'Combo Sushi', detalhe: '12 peças variadas (Salmão/Atum)', preco: 30.00 }]
    },
    { 
      id: 'ent4', valor: 18.90, status: 'finalizada', data: '2023-10-20T14:30:00Z', lojaId: 'l1', entregadorId: 'e1', clienteNome: 'Roberto Dias', endereco: 'Retirada',
      itens: [{ qtd: 1, nome: 'Açaí 500ml', detalhe: 'Com granola, leite ninho e morango', preco: 18.90 }]
    },
  ],
  saques: [],
  faturas: [
    { id: 'f1', mesReferencia: 'Outubro 2023', valor: 199.90, status: 'Pago' },
    { id: 'f2', mesReferencia: 'Setembro 2023', valor: 199.90, status: 'Pago' },
    { id: 'f3', mesReferencia: 'Agosto 2023', valor: 199.90, status: 'Pago' },
  ],
  meiosPagamento: [
    { id: 'm1', tipo: 'Cartão', detalhe: 'Mastercard **** 4242', extra: 'Expira em 12/26' },
    { id: 'm2', tipo: 'PIX', detalhe: 'Chave PIX', extra: 'pede.mais@cnpj.com.br' },
  ],
  setUser: (user) => set({ user }),
  updatePlanoLoja: (lojaId, planoId) => set((state) => ({
    lojas: state.lojas.map(l => l.id === lojaId ? { ...l, planoId } : l)
  })),
  updateLoja: (lojaId, data) => set((state) => ({
    lojas: state.lojas.map(l => l.id === lojaId ? { ...l, ...data } : l)
  })),
  addEntregador: (entregador) => set((state) => ({
    entregadores: [...state.entregadores, { 
      ...entregador, 
      entregasTotal: 0, 
      nivel: 'Bronze', 
      xp: 0, 
      badges: [], 
      tipoVeiculo: 'Moto', 
      dataAdesao: new Date().toISOString() 
    } as Entregador]
  })),
  cancelarAssinatura: (lojaId) => set((state) => ({
    lojas: state.lojas.map(l => l.id === lojaId ? { ...l, statusAssinatura: 'cancelado' } : l)
  })),
  batchUpdatePlano: (lojaIds, planoId) => set((state) => ({
    lojas: state.lojas.map(l => lojaIds.includes(l.id) ? { ...l, planoId } : l)
  })),
  atribuirEntregador: (entregaId, entregadorId) => set((state) => ({
    entregas: state.entregas.map(e => e.id === entregaId ? { ...e, status: 'em_transito', entregadorId } : e)
  })),
  atualizarStatusPedido: (entregaId, novoStatus) => set((state) => ({
    entregas: state.entregas.map(e => e.id === entregaId ? { ...e, status: novoStatus } : e)
  })),
  solicitarSaque: (saque) => set((state) => ({
    saques: [saque, ...state.saques],
    entregadores: state.entregadores.map(e => e.id === saque.entregadorId ? { ...e, saldo: e.saldo - saque.valor } : e)
  })),
  
  // UI Actions
  addNotification: (type, message) => set((state) => ({
    notifications: [...state.notifications, { id: Math.random().toString(36), type, message }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
