
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, Entregador, Entrega, Loja, Plano, Fatura, MeioPagamento, Saque, ItemPedido, Notification, SystemSettings, Produto, CartItem, DiaFuncionamento, SupportTicket, TicketMessage, Funcionario } from './types';
import { generateID } from './utils';

// Helper para horários padrão
const HORARIOS_PADRAO: DiaFuncionamento[] = [
  { dia: 'Segunda-feira', ativo: true, intervalos: [{ inicio: '08:00', fim: '18:00' }] },
  { dia: 'Terça-feira', ativo: true, intervalos: [{ inicio: '08:00', fim: '18:00' }] },
  { dia: 'Quarta-feira', ativo: true, intervalos: [{ inicio: '08:00', fim: '18:00' }] },
  { dia: 'Quinta-feira', ativo: true, intervalos: [{ inicio: '08:00', fim: '18:00' }] },
  { dia: 'Sexta-feira', ativo: true, intervalos: [{ inicio: '08:00', fim: '22:00' }] },
  { dia: 'Sábado', ativo: true, intervalos: [{ inicio: '10:00', fim: '23:00' }] },
  { dia: 'Domingo', ativo: false, intervalos: [] },
];

// Dados iniciais da Loja Demo (Restaurante Sabor - Tucuruí)
const LOJA_DEMO_DEFAULT: Loja = { 
  id: 'l1', 
  nome: 'Restaurante Sabor (DEMO)', 
  slug: 'restaurante-sabor', 
  planoId: '2', 
  statusAssinatura: 'ativo', 
  proximoVencimento: '2025-11-15', 
  whatsapp: '5594999999999',
  categoria: 'Restaurante',
  endereco: 'Av. Raimundo Veridiano Cardoso, Tucuruí - PA',
  taxaEntrega: 5.90,
  tempoMin: 30,
  tempoMax: 45,
  banner: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
  logo: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
  areasEntrega: [
    { id: 'a1', nome: 'Centro Comercial', taxa: 4.00, tempoMin: 15, tempoMax: 25, raioKm: 2, ativa: true, tipoTaxa: 'fixa', lat: -3.766052, lng: -49.672367 },
    { id: 'a2', nome: 'Vila Permanente', taxa: 7.00, tempoMin: 30, tempoMax: 45, raioKm: 4, ativa: true, tipoTaxa: 'fixa', lat: -3.722839, lng: -49.654308 }
  ],
  lojaAbertaManual: true,
  horarios: HORARIOS_PADRAO,
  feriados: [],
  categoriasCardapio: ['Burgers Artesanais', 'Pizzas Premium', 'Bebidas', 'Sobremesas', 'Combos', 'Entradas'],
  stats: { carrinhos: 1200, finalizados: 850, mrr: 199.90 } 
};

// Tickets Mock
const TICKETS_MOCK: SupportTicket[] = [
  {
    id: 't1',
    lojaId: 'l1',
    lojaNome: 'Restaurante Sabor (DEMO)',
    assunto: 'Problema com integração de pagamento',
    categoria: 'Financeiro',
    descricao: 'Não estou conseguindo gerar o relatório de pagamentos via PIX da semana passada.',
    status: 'Aberto',
    prioridade: 'Alta',
    dataCriacao: new Date(Date.now() - 86400000).toISOString(),
    dataAtualizacao: new Date(Date.now() - 86400000).toISOString(),
    mensagens: [
      { id: 'm1', senderName: 'Lojista', text: 'Olá, preciso de ajuda com o relatório PIX.', timestamp: new Date(Date.now() - 86400000).toISOString(), isAdmin: false }
    ]
  },
  {
    id: 't2',
    lojaId: 'l1',
    lojaNome: 'Restaurante Sabor (DEMO)',
    assunto: 'Dúvida sobre horário de feriado',
    categoria: 'Técnico',
    descricao: 'Como configuro um horário especial para o Natal?',
    status: 'Resolvido',
    prioridade: 'Baixa',
    dataCriacao: new Date(Date.now() - 172800000).toISOString(),
    dataAtualizacao: new Date(Date.now() - 100000000).toISOString(),
    mensagens: [
      { id: 'm1', senderName: 'Lojista', text: 'Como configuro feriado?', timestamp: new Date(Date.now() - 172800000).toISOString(), isAdmin: false },
      { id: 'm2', senderName: 'Suporte', text: 'Você pode ir em Configurações > Horários > Feriados.', timestamp: new Date(Date.now() - 100000000).toISOString(), isAdmin: true }
    ]
  }
];

// Produtos Iniciais (Mock Demo)
const PRODUTOS_DEMO: Produto[] = [
  { 
    id: 'b1', 
    lojaId: 'l1', 
    nome: 'Double Bacon Master', 
    categoria: 'Burgers Artesanais', 
    descricao: 'Pão brioche, dois blends de 160g, cheddar inglês, bacon crocante.', 
    preco: 42.90, 
    imagem: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop', 
    imagens: [
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=600&auto=format&fit=crop'
    ],
    destaque: true, 
    maisVendido: true, 
    disponivel: true, 
    tags: ['Matador de Fome'] 
  },
  { 
    id: 'p1', 
    lojaId: 'l1', 
    nome: 'Margherita Especial', 
    categoria: 'Pizzas Premium', 
    descricao: 'Molho de tomate pelati, mozzarella di bufala, manjericão e azeite trufado.', 
    preco: 65.00, 
    imagem: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=600&auto=format&fit=crop', 
    disponivel: true, 
    tags: ['Vegetariano'] 
  },
  { 
    id: 'd1', 
    lojaId: 'l1', 
    nome: 'Coca-Cola 350ml', 
    categoria: 'Bebidas', 
    descricao: 'Lata gelada.', 
    preco: 6.00, 
    imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=600&auto=format&fit=crop', 
    disponivel: true 
  },
];

interface AppState {
  user: User | null;
  lojas: Loja[];
  planos: Plano[];
  produtos: Produto[];
  entregadores: Entregador[];
  entregas: Entrega[];
  saques: Saque[];
  faturas: Fatura[];
  meiosPagamento: MeioPagamento[];
  notifications: Notification[];
  tickets: SupportTicket[];
  funcionarios: Funcionario[];
  isSidebarOpen: boolean;
  systemSettings: SystemSettings;
  cart: CartItem[];
  cartLojaId: string | null;
  myOrderIds: string[];

  // Actions
  setUser: (user: User | null) => void;
  updateCurrentUser: (data: Partial<User>) => void;
  updatePlanoLoja: (lojaId: string, planoId: string) => void;
  updateLoja: (lojaId: string, data: Partial<Loja>) => void;
  addLoja: (loja: Loja) => void;
  deleteLoja: (lojaId: string) => void;
  addProduto: (produto: Produto) => void;
  updateProduto: (id: string, data: Partial<Produto>) => void;
  deleteProduto: (id: string) => void;
  addToCart: (lojaId: string, produtoId: string) => void;
  updateCartQuantity: (produtoId: string, delta: number) => void;
  setCartQuantity: (produtoId: string, qtd: number) => void;
  clearCart: () => void;
  addPlano: (plano: Plano) => void;
  updatePlano: (id: string, data: Partial<Plano>) => void;
  deletePlano: (id: string) => void;
  addEntregador: (entregador: any) => void;
  updateEntregador: (id: string, data: Partial<Entregador>) => void;
  deleteEntregador: (id: string) => void;
  addMeioPagamento: (meio: MeioPagamento) => void;
  updateMeioPagamento: (id: string, data: Partial<MeioPagamento>) => void;
  deleteMeioPagamento: (id: string) => void;
  addTicket: (ticket: SupportTicket) => void;
  updateTicketStatus: (id: string, status: SupportTicket['status']) => void;
  replyTicket: (ticketId: string, message: TicketMessage) => void;
  addEntrega: (entrega: Entrega) => void;
  cancelarAssinatura: (lojaId: string) => void;
  batchUpdatePlano: (lojaIds: string[], planoId: string) => void;
  atribuirEntregador: (entregaId: string, entregadorId: string) => void;
  atualizarStatusPedido: (entregaId: string, novoStatus: Entrega['status']) => void;
  updateEntrega: (entregaId: string, data: Partial<Entrega>) => void;
  solicitarSaque: (saque: Saque) => void;
  resetDemoStore: () => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  addNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  removeNotification: (id: string) => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  
  // Funcionario Actions
  addFuncionario: (funcionario: Funcionario) => void;
  updateFuncionario: (id: string, data: Partial<Funcionario>) => void;
  deleteFuncionario: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null, 
      isSidebarOpen: false,
      notifications: [],
      cart: [],
      cartLojaId: null,
      myOrderIds: [],
      systemSettings: {
        appName: 'Pede Mais',
        maintenanceMode: false,
        allowNewRegistrations: true,
        globalAnnouncement: '',
        supportPhone: '5511999999999',
        pixKey: 'financeiro@pedemais.app',
        storeCategories: ['Restaurante', 'Mercado & Conveniência', 'Padaria', 'Farmácia', 'Lanches', 'Pet Shop', 'Outros']
      },
      planos: [
        { id: '1', nome: 'Básico', preco: 99.90, limitePedidos: 500, limiteEntregadores: 5, recursos: ['WhatsApp Pay', 'Cardápio Digital', 'Suporte por e-mail'], cor: 'bg-gray-100' },
        { id: '2', nome: 'Pro Amazônia', preco: 199.90, limitePedidos: 1000, limiteEntregadores: 10, recursos: ['Suporte prioritário 24/7', 'Dashboard avançado', 'IA de Roteirização'], cor: 'bg-emerald-600', destaque: true },
        { id: '3', nome: 'Enterprise', preco: 499.90, limitePedidos: 99999, limiteEntregadores: 999, recursos: ['Gerente de conta dedicado', 'Integração API customizada', 'White Label total'], cor: 'bg-purple-600' },
      ],
      lojas: [LOJA_DEMO_DEFAULT],
      produtos: PRODUTOS_DEMO,
      tickets: TICKETS_MOCK,
      entregadores: [
        { id: 'e1', nome: 'Ricardo Santos', telefone: '94 91234-5678', status: 'disponível', saldo: 150.50, entregasHoje: 12, entregasTotal: 145, nivel: 'Diamante', xp: 850, badges: [], lojaId: 'l1', tipoVeiculo: 'Caminhão (Pesado)', placa: 'ABC-1234', dataAdesao: '2023-10-24' },
        { id: 'e2', nome: 'Julia Mendes', telefone: '94 98765-4321', status: 'em_pausa', saldo: 89.00, entregasHoje: 8, entregasTotal: 45, nivel: 'Prata', xp: 320, badges: [], lojaId: 'l1', tipoVeiculo: 'Moto', placa: 'DEF-5678', dataAdesao: '2023-09-12' },
        { id: 'e3', nome: 'Marcos Almeida', telefone: '94 95555-4444', status: 'suspenso', saldo: 210.00, entregasHoje: 15, entregasTotal: 88, nivel: 'Ouro', xp: 610, badges: [], lojaId: 'l1', tipoVeiculo: 'Van', placa: 'GHI-9012', dataAdesao: '2023-01-05' },
        { id: 'e4', nome: 'Carlos Vega', telefone: '94 94444-3333', status: 'disponível', saldo: 45.00, entregasHoje: 10, entregasTotal: 22, nivel: 'Bronze', xp: 150, badges: [], lojaId: 'l1', tipoVeiculo: 'Caminhão (Leve)', placa: 'JKL-3456', dataAdesao: '2023-11-15' },
        { id: 'e5', nome: 'Sarah Wilson', telefone: '94 92222-1111', status: 'disponível', saldo: 300.00, entregasHoje: 14, entregasTotal: 210, nivel: 'Diamante', xp: 980, badges: [], lojaId: 'l1', tipoVeiculo: 'Sedan', placa: 'MNO-7890', dataAdesao: '2024-02-28' },
      ],
      funcionarios: [
        { 
          id: 'func1', lojaId: 'l1', nome: 'Ana Gerente', email: 'ana@loja.com', telefone: '94 91111-2222', cargo: 'Gerente', ativo: true, 
          permissoes: ['ver_dashboard', 'gerir_pedidos', 'gerir_cardapio', 'gerir_entregadores', 'ver_financeiro', 'gerir_financeiro', 'configuracoes_loja'], 
          dataCriacao: new Date(Date.now() - 50000000).toISOString()
        },
        { 
          id: 'func2', lojaId: 'l1', nome: 'João Cozinha', email: 'joao@loja.com', telefone: '94 93333-4444', cargo: 'Cozinha', ativo: true, 
          permissoes: ['gerir_pedidos'], 
          dataCriacao: new Date(Date.now() - 20000000).toISOString()
        }
      ],
      entregas: [
        { 
          id: 'ent1', valor: 45.90, status: 'pendente', data: new Date().toISOString(), lojaId: 'l1', clienteNome: 'Mariana Silva', clienteTelefone: '94 99123-4567', endereco: 'Rua das Flores, 123',
          itens: [
            { qtd: 1, nome: 'X-Bacon Duplo', detalhe: 'Sem cebola, maionese extra', preco: 35.90 }, 
            { qtd: 1, nome: 'Coca-Cola 2L', detalhe: 'Bem gelada', preco: 10.00 }
          ]
        },
        { 
          id: 'ent2', valor: 82.50, status: 'preparando', data: new Date().toISOString(), lojaId: 'l1', clienteNome: 'Carlos Oliveira', clienteTelefone: '94 98888-7777', endereco: 'Av. Paulista, 1000',
          itens: [
            { qtd: 2, nome: 'Pizza Calabresa', detalhe: 'Borda recheada de catupiry', preco: 35.00 }, 
            { qtd: 1, nome: 'Guaraná Antártica 2L', preco: 12.50 }
          ]
        },
        { 
          id: 'ent3', valor: 30.00, status: 'pronto', data: new Date().toISOString(), lojaId: 'l1', clienteNome: 'Fernanda Costa', clienteTelefone: '94 97777-6666', endereco: 'Rua Augusta, 500',
          itens: [{ qtd: 1, nome: 'Combo Sushi', detalhe: '12 peças variadas (Salmão/Atum)', preco: 30.00 }]
        },
        { 
          id: 'ent4', valor: 18.90, status: 'finalizada', data: '2023-10-20T14:30:00Z', lojaId: 'l1', entregadorId: 'e1', clienteNome: 'Roberto Dias', clienteTelefone: '94 96666-5555', endereco: 'Retirada',
          itens: [{ qtd: 1, nome: 'Açaí 500ml', detalhe: 'Com granola, leite ninho e morango', preco: 18.90 }]
        },
      ],
      saques: [],
      // Faturas vazias para ambiente real
      faturas: [],
      // Meios de pagamento vazios para ambiente real
      meiosPagamento: [],
      
      setUser: (user) => set({ user }),
      updateCurrentUser: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      })),
      
      updatePlanoLoja: (lojaId, planoId) => set((state) => ({
        lojas: state.lojas.map(l => l.id === lojaId ? { ...l, planoId } : l)
      })),
      updateLoja: (lojaId, data) => set((state) => ({
        lojas: state.lojas.map(l => l.id === lojaId ? { ...l, ...data } : l)
      })),
      addLoja: (loja) => set((state) => ({
        lojas: [...state.lojas, loja]
      })),
      deleteLoja: (lojaId) => set((state) => ({
        lojas: state.lojas.filter(l => l.id !== lojaId)
      })),
      
      addProduto: (produto) => set((state) => ({
        produtos: [...state.produtos, produto]
      })),
      updateProduto: (id, data) => set((state) => ({
        produtos: state.produtos.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deleteProduto: (id) => set((state) => ({
        produtos: state.produtos.filter(p => p.id !== id)
      })),

      addToCart: (lojaId, produtoId) => set((state) => {
        const isSameStore = state.cartLojaId === lojaId;
        const newCart = isSameStore ? [...state.cart] : [];
        const existingItem = newCart.find(i => i.produtoId === produtoId);

        if (existingItem) {
            existingItem.qtd += 1;
        } else {
            newCart.push({ produtoId, qtd: 1 });
        }

        return { cart: newCart, cartLojaId: lojaId };
      }),
      updateCartQuantity: (produtoId, delta) => set((state) => ({
        cart: state.cart.map(item => {
            if (item.produtoId === produtoId) {
                return { ...item, qtd: Math.max(0, item.qtd + delta) };
            }
            return item;
        }).filter(item => item.qtd > 0)
      })),
      setCartQuantity: (produtoId, qtd) => set((state) => ({
        cart: state.cart.map(item => {
            if (item.produtoId === produtoId) {
                return { ...item, qtd: Math.max(0, qtd) };
            }
            return item;
        }).filter(item => item.qtd > 0)
      })),
      clearCart: () => set({ cart: [], cartLojaId: null }),

      addPlano: (plano) => set((state) => ({
        planos: [...state.planos, plano]
      })),
      updatePlano: (id, data) => set((state) => ({
        planos: state.planos.map(p => p.id === id ? { ...p, ...data } : p)
      })),
      deletePlano: (id) => set((state) => ({
        planos: state.planos.filter(p => p.id !== id)
      })),

      addEntregador: (entregador) => set((state) => ({
        entregadores: [...state.entregadores, { 
          ...entregador, 
          entregasTotal: 0, 
          nivel: 'Bronze', 
          xp: 0, 
          badges: [], 
          dataAdesao: new Date().toISOString() 
        } as Entregador]
      })),
      updateEntregador: (id, data) => set((state) => ({
        entregadores: state.entregadores.map(e => e.id === id ? { ...e, ...data } : e)
      })),
      deleteEntregador: (id) => set((state) => ({
        entregadores: state.entregadores.filter(e => e.id !== id)
      })),

      addMeioPagamento: (meio) => set((state) => ({
        meiosPagamento: [...state.meiosPagamento, meio]
      })),
      updateMeioPagamento: (id, data) => set((state) => ({
        meiosPagamento: state.meiosPagamento.map(m => m.id === id ? { ...m, ...data } : m)
      })),
      deleteMeioPagamento: (id) => set((state) => ({
        meiosPagamento: state.meiosPagamento.filter(m => m.id !== id)
      })),

      addTicket: (ticket) => set((state) => ({
        tickets: [ticket, ...state.tickets]
      })),
      updateTicketStatus: (id, status) => set((state) => ({
        tickets: state.tickets.map(t => t.id === id ? { ...t, status, dataAtualizacao: new Date().toISOString() } : t)
      })),
      replyTicket: (ticketId, message) => set((state) => ({
        tickets: state.tickets.map(t => t.id === ticketId ? { ...t, mensagens: [...t.mensagens, message], dataAtualizacao: new Date().toISOString() } : t)
      })),

      addEntrega: (entrega) => set((state) => ({
        entregas: [entrega, ...state.entregas],
        myOrderIds: [...state.myOrderIds, entrega.id]
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
      updateEntrega: (entregaId, data) => set((state) => ({
        entregas: state.entregas.map(e => e.id === entregaId ? { ...e, ...data } : e)
      })),
      solicitarSaque: (saque) => set((state) => ({
        saques: [saque, ...state.saques],
        entregadores: state.entregadores.map(e => e.id === saque.entregadorId ? { ...e, saldo: e.saldo - saque.valor } : e)
      })),
      resetDemoStore: () => set((state) => ({
        lojas: [LOJA_DEMO_DEFAULT, ...state.lojas.filter(l => l.id !== 'l1')],
        produtos: PRODUTOS_DEMO 
      })),
      updateSystemSettings: (settings) => set((state) => ({
        systemSettings: { ...state.systemSettings, ...settings }
      })),
      
      addNotification: (type, message) => set((state) => ({
        notifications: [...state.notifications, { id: generateID('not-'), type, message }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),

      // Funcionario Actions Implementation
      addFuncionario: (funcionario) => set((state) => ({
        funcionarios: [...state.funcionarios, funcionario]
      })),
      updateFuncionario: (id, data) => set((state) => ({
        funcionarios: state.funcionarios.map(f => f.id === id ? { ...f, ...data } : f)
      })),
      deleteFuncionario: (id) => set((state) => ({
        funcionarios: state.funcionarios.filter(f => f.id !== id)
      })),
    }),
    {
      name: 'pede-mais-storage',
      version: 2, // Incrementando versão para forçar a migração
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        // Se a versão for anterior a 2, fazemos o merge manual
        if (version < 2) {
            // Pega o estado padrão atual (com os novos campos)
            const defaultState = {
                systemSettings: {
                    appName: 'Pede Mais',
                    maintenanceMode: false,
                    allowNewRegistrations: true,
                    globalAnnouncement: '',
                    supportPhone: '5511999999999',
                    pixKey: 'financeiro@pedemais.app',
                    storeCategories: ['Restaurante', 'Mercado & Conveniência', 'Padaria', 'Farmácia', 'Lanches', 'Pet Shop', 'Outros']
                },
                // ... outros defaults se necessário
            };

            return {
                ...persistedState,
                // Garante que systemSettings tenha todos os campos, preservando os existentes
                systemSettings: {
                    ...defaultState.systemSettings,
                    ...(persistedState.systemSettings || {})
                },
                // Garante que as lojas tenham os novos campos de tema
                lojas: (persistedState.lojas || []).map((loja: any) => ({
                    ...loja,
                    themeColor: loja.themeColor || '#059669',
                    font: loja.font || 'Inter',
                    categoriasCardapio: loja.categoriasCardapio || []
                })),
                // Garante que produtos tenham novos campos
                produtos: (persistedState.produtos || []).map((prod: any) => ({
                    ...prod,
                    ingredientes: prod.ingredientes || '',
                    informacoesNutricionais: prod.informacoesNutricionais || '',
                    acompanhamentos: prod.acompanhamentos || [],
                    tempoPreparo: prod.tempoPreparo || 15
                }))
            };
        }
        return persistedState as AppState;
      },
      partialize: (state) => ({ 
        user: state.user,
        lojas: state.lojas,
        entregadores: state.entregadores,
        entregas: state.entregas,
        planos: state.planos,
        systemSettings: state.systemSettings,
        produtos: state.produtos,
        cart: state.cart,
        cartLojaId: state.cartLojaId,
        meiosPagamento: state.meiosPagamento,
        tickets: state.tickets,
        myOrderIds: state.myOrderIds,
        funcionarios: state.funcionarios
      }),
    }
  )
);
