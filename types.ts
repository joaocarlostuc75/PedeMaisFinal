
export type Role = 'super_admin' | 'lojista' | 'entregador' | 'cliente';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
  lojaId?: string;
  avatar?: string; // Novo campo para foto/logo do perfil
}

export interface Badge {
  id: string;
  nome: string;
  icone: string;
  descricao: string;
}

export interface Entregador {
  id: string;
  nome: string;
  telefone: string;
  status: 'disponível' | 'ocupado' | 'em_pausa' | 'suspenso';
  saldo: number;
  entregasHoje: number;
  entregasTotal: number;
  nivel: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  xp: number;
  badges: Badge[];
  lojaId: string;
  tipoVeiculo: 'Moto' | 'Caminhão (Pesado)' | 'Caminhão (Leve)' | 'Van' | 'Sedan' | 'Bicicleta';
  placa?: string; // Novo campo
  dataAdesao: string;
}

export interface Fatura {
  id: string;
  mesReferencia: string;
  valor: number;
  status: 'Pago' | 'Pendente' | 'Atrasado';
}

export interface MeioPagamento {
  id: string;
  tipo: 'Cartão' | 'PIX';
  detalhe: string;
  extra?: string;
}

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  limitePedidos: number;
  limiteEntregadores: number;
  recursos: string[];
  cor?: string;
  destaque?: boolean;
  privado?: boolean; // Novo campo para planos secretos/VIP
}

export interface Intervalo {
  inicio: string;
  fim: string;
}

export interface DiaFuncionamento {
  dia: string; // Segunda, Terça, etc.
  ativo: boolean;
  intervalos: Intervalo[];
}

export interface Feriado {
  id: string;
  data: string;
  descricao: string;
  tipo: 'fechado' | 'horario_especial';
}

export interface AreaEntrega {
  id: string;
  nome: string;
  taxa: number;
  tempoMin: number;
  tempoMax: number;
  raioKm: number;
  ativa: boolean;
  tipoTaxa: 'fixa' | 'km';
  lat?: number;
  lng?: number;
}

export interface Loja {
  id: string;
  nome: string;
  slug: string;
  planoId: string;
  statusAssinatura: 'ativo' | 'cancelado' | 'teste';
  proximoVencimento: string;
  whatsapp: string;
  email?: string;
  telefone?: string;
  banner?: string;
  logo?: string;
  endereco?: string;
  corPrimaria?: string;
  categoria?: string;
  descricao?: string;
  taxaEntrega?: number;
  tempoMin?: number;
  tempoMax?: number;
  aceitaRetirada?: boolean;
  areasEntrega?: AreaEntrega[]; // Novo campo
  
  // Novos campos de horário
  lojaAbertaManual?: boolean; // Toggle global
  horarios?: DiaFuncionamento[];
  feriados?: Feriado[];

  stats?: {
    carrinhos: number;
    finalizados: number;
    mrr: number;
  };
}

export interface Produto {
  id: string;
  lojaId: string;
  nome: string;
  categoria: string;
  descricao: string;
  preco: number;
  imagem: string;
  imagens?: string[]; // Array de imagens para carrossel
  destaque?: boolean;
  maisVendido?: boolean;
  disponivel: boolean;
  tags?: string[];
  oldPrice?: number;
}

export interface ItemPedido {
  qtd: number;
  nome: string;
  detalhe?: string;
  preco?: number;
}

export interface Entrega {
  id: string;
  clienteNome?: string;
  itens: ItemPedido[];
  valor: number;
  status: 'pendente' | 'preparando' | 'pronto' | 'em_transito' | 'finalizada' | 'cancelada';
  data: string;
  entregadorId?: string;
  lojaId: string;
  endereco?: string;
  metodoPagamento?: string;
  tipoEntrega?: 'entrega' | 'retirada';
}

export interface Saque {
  id: string;
  entregadorId: string;
  valor: number;
  status: 'processando' | 'pago' | 'recusado';
  data: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface SystemSettings {
  appName: string;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  globalAnnouncement: string;
  supportPhone: string;
  pixKey: string;
}

export interface CartItem {
  produtoId: string;
  qtd: number;
}

// Interfaces de Suporte
export interface TicketMessage {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAdmin: boolean; // True se for resposta do suporte, False se for lojista
}

export interface SupportTicket {
  id: string;
  lojaId: string;
  lojaNome: string;
  assunto: string;
  categoria: 'Financeiro' | 'Técnico' | 'Comercial' | 'Outros';
  descricao: string;
  status: 'Aberto' | 'Em Andamento' | 'Resolvido';
  prioridade: 'Baixa' | 'Média' | 'Alta';
  dataCriacao: string;
  dataAtualizacao: string;
  mensagens: TicketMessage[];
}
