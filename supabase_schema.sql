
-- 1. Limpeza (Opcional, cuidado em produção)
-- DROP TABLE IF EXISTS saques CASCADE;
-- DROP TABLE IF EXISTS itens_pedido CASCADE; -- Se optar por normalizar, mas usaremos JSONB para itens
-- DROP TABLE IF EXISTS entregas CASCADE;
-- DROP TABLE IF EXISTS entregadores CASCADE;
-- DROP TABLE IF EXISTS produtos CASCADE;
-- DROP TABLE IF EXISTS lojas CASCADE;
-- DROP TABLE IF EXISTS planos CASCADE;
-- DROP TABLE IF EXISTS profiles CASCADE;

-- 2. Tipos e Enums (Baseado no types.ts)
CREATE TYPE user_role AS ENUM ('super_admin', 'lojista', 'entregador', 'cliente');
CREATE TYPE entregador_status AS ENUM ('disponível', 'ocupado', 'em_pausa', 'suspenso');
CREATE TYPE entrega_status AS ENUM ('pendente', 'preparando', 'pronto', 'em_transito', 'finalizada', 'cancelada');
CREATE TYPE loja_status_assinatura AS ENUM ('ativo', 'cancelado', 'teste');
CREATE TYPE saque_status AS ENUM ('processando', 'pago', 'recusado');

-- 3. Tabela de Perfis (Extensão da auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'lojista',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Planos
CREATE TABLE planos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  limite_pedidos INT DEFAULT 0,
  limite_entregadores INT DEFAULT 0,
  recursos TEXT[] DEFAULT '{}', -- Array de strings
  cor TEXT, -- ex: 'bg-emerald-600'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Lojas
CREATE TABLE lojas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id), -- Dono da loja
  plano_id UUID REFERENCES planos(id),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status_assinatura loja_status_assinatura DEFAULT 'teste',
  proximo_vencimento DATE,
  whatsapp TEXT,
  email_contato TEXT,
  telefone_contato TEXT,
  banner_url TEXT,
  logo_url TEXT,
  endereco TEXT,
  cor_primaria TEXT DEFAULT '#059669',
  categoria TEXT DEFAULT 'Restaurante',
  descricao TEXT,
  taxa_entrega DECIMAL(10, 2) DEFAULT 0.00,
  tempo_min INT DEFAULT 30,
  tempo_max INT DEFAULT 45,
  aceita_retirada BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Produtos (Itens do Cardápio)
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  imagem_url TEXT,
  categoria TEXT NOT NULL, -- ex: 'Burgers', 'Bebidas'
  disponivel BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  mais_vendido BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Entregadores (Frota)
CREATE TABLE entregadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE, -- Vinculado a uma loja específica no MVP
  user_id UUID REFERENCES auth.users(id), -- Opcional: Se o entregador tiver login no sistema
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  status entregador_status DEFAULT 'disponível',
  saldo DECIMAL(10, 2) DEFAULT 0.00,
  entregas_hoje INT DEFAULT 0,
  entregas_total INT DEFAULT 0,
  nivel TEXT DEFAULT 'Bronze', -- Bronze, Prata, Ouro, Diamante
  xp INT DEFAULT 0,
  tipo_veiculo TEXT DEFAULT 'Moto',
  data_adesao TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Entregas (Pedidos)
CREATE TABLE entregas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  entregador_id UUID REFERENCES entregadores(id), -- Pode ser NULL inicialmente
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT, -- Importante para contato
  endereco_entrega TEXT,
  tipo_entrega TEXT DEFAULT 'entrega', -- 'entrega' ou 'retirada'
  itens JSONB NOT NULL, -- Armazena o array de itens: [{nome, qtd, preco, detalhe}]
  valor_total DECIMAL(10, 2) NOT NULL,
  taxa_entrega_aplicada DECIMAL(10, 2) DEFAULT 0.00,
  metodo_pagamento TEXT,
  status entrega_status DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Saques
CREATE TABLE saques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entregador_id UUID REFERENCES entregadores(id) ON DELETE CASCADE NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  status saque_status DEFAULT 'processando',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRIGGER: Criar Profile Automaticamente ao Cadastrar Usuário no Auth do Supabase
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nome', (new.raw_user_meta_data->>'role')::user_role);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- =============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- =============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saques ENABLE ROW LEVEL SECURITY;

-- --- PROFILES ---
-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- --- PLANOS ---
-- Leitura pública (para exibir na landing page)
CREATE POLICY "Public read plans" ON planos FOR SELECT USING (true);
-- Apenas super_admin edita (simplificado: ninguém via API pública por enquanto)

-- --- LOJAS ---
-- Público pode ver lojas (Para a PublicShop)
CREATE POLICY "Public view lojas" ON lojas FOR SELECT USING (true);
-- Lojista pode editar SUA PRÓPRIA loja
CREATE POLICY "Lojista update own loja" ON lojas FOR UPDATE USING (auth.uid() = owner_id);
-- Lojista pode criar loja
CREATE POLICY "Lojista insert loja" ON lojas FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- --- PRODUTOS ---
-- Público pode ver produtos (Cardápio)
CREATE POLICY "Public view produtos" ON produtos FOR SELECT USING (true);
-- Lojista gerencia produtos da SUA loja
CREATE POLICY "Lojista manage produtos" ON produtos FOR ALL USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = produtos.loja_id AND lojas.owner_id = auth.uid())
);

-- --- ENTREGADORES ---
-- Lojista gerencia entregadores da SUA loja
CREATE POLICY "Lojista manage entregadores" ON entregadores FOR ALL USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregadores.loja_id AND lojas.owner_id = auth.uid())
);
-- O Próprio entregador pode ver seus dados (se tiver login vinculado)
CREATE POLICY "Entregador view self" ON entregadores FOR SELECT USING (user_id = auth.uid());

-- --- ENTREGAS (PEDIDOS) ---
-- Público (Anon) pode CRIAR pedidos (Checkout)
CREATE POLICY "Anon create pedidos" ON entregas FOR INSERT WITH CHECK (true);

-- Cliente pode ver seus pedidos (via ID ou se estiver logado - lógica simplificada para MVP)
-- Vamos focar no Lojista e Entregador:

-- Lojista vê e edita pedidos da SUA loja
CREATE POLICY "Lojista view pedidos" ON entregas FOR SELECT USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregas.loja_id AND lojas.owner_id = auth.uid())
);
CREATE POLICY "Lojista update pedidos" ON entregas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregas.loja_id AND lojas.owner_id = auth.uid())
);

-- Entregador vê pedidos atribuídos a ele
CREATE POLICY "Entregador view assigned pedidos" ON entregas FOR SELECT USING (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = entregas.entregador_id AND entregadores.user_id = auth.uid())
);
-- Entregador atualiza status de pedidos atribuídos a ele
CREATE POLICY "Entregador update assigned pedidos" ON entregas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = entregas.entregador_id AND entregadores.user_id = auth.uid())
);

-- --- SAQUES ---
-- Entregador vê seus saques
CREATE POLICY "Entregador view saques" ON saques FOR SELECT USING (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = saques.entregador_id AND entregadores.user_id = auth.uid())
);
-- Entregador solicita saque
CREATE POLICY "Entregador insert saques" ON saques FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = saques.entregador_id AND entregadores.user_id = auth.uid())
);
-- Lojista vê saques dos seus entregadores
CREATE POLICY "Lojista view saques" ON saques FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM entregadores 
    JOIN lojas ON lojas.id = entregadores.loja_id
    WHERE entregadores.id = saques.entregador_id AND lojas.owner_id = auth.uid()
  )
);

-- =============================================================================
-- SEED DATA (Dados Iniciais para Teste)
-- =============================================================================
-- Inserir Planos Padrão
INSERT INTO planos (nome, preco, limite_pedidos, limite_entregadores, recursos, cor) VALUES
('Básico', 99.90, 500, 5, '{WhatsApp Pay, Cardápio Digital}', 'bg-gray-600'),
('Pro Amazônia', 199.90, 1000, 10, '{Suporte 24/7, Dashboard Avançado, IA Roteirização}', 'bg-emerald-600'),
('Enterprise', 499.90, 99999, 999, '{White Label Total, API Customizada}', 'bg-purple-600');

