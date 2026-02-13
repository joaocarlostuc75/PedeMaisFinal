
export type Role = 'super_admin' | 'lojista' | 'entregador' | 'cliente';

export interface User {
  id: string;
  nome: string;
  email: string;
  role: Role;
  lojaId?: string;
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
  status: 'disponível' | 'ocupado';
  saldo: number;
  entregasHoje: number;
  entregasTotal: number;
  nivel: 'Bronze' | 'Prata' | 'Ouro' | 'Diamante';
  xp: number;
  badges: Badge[];
  lojaId: string;
}

export interface Saque {
  id: string;
  entregadorId: string;
  valor: number;
  status: 'processando' | 'pago' | 'cancelado';
  data: string;
}

export interface Entrega {
  id: string;
  pedidoId: string;
  entregadorId: string;
  valor: number;
  status: 'pendente' | 'aceita' | 'finalizada';
  data: string;
  hora: number; // 0-23
}

export interface Plano {
  id: string;
  nome: string;
  preco: number;
  limitePedidos: number;
  limiteLojas: number;
  recursos: string[];
}

export interface Loja {
  id: string;
  nome: string;
  slug: string;
  planoId: string;
  statusAssinatura: 'ativo' | 'cancelado' | 'teste';
  proximoVencimento: string;
  whatsapp: string;
  stats?: {
    carrinhos: number;
    finalizados: number;
    mrr: number;
  };
}

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
}
