
-- =============================================================================
-- SCRIPT DE REINICIALIZAÇÃO TOTAL (CORREÇÃO DE SCHEMA)
-- =============================================================================
-- Este script remove as tabelas antigas para garantir que não haja conflitos de colunas ou tipos.

-- 1. Limpeza de Triggers e Funções Antigas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Limpeza de Tabelas (Ordem importa devido às chaves estrangeiras)
DROP TABLE IF EXISTS saques CASCADE;
DROP TABLE IF EXISTS entregas CASCADE;
DROP TABLE IF EXISTS entregadores CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS lojas CASCADE;
DROP TABLE IF EXISTS planos CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Limpeza de Tipos (Enums)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS entregador_status CASCADE;
DROP TYPE IF EXISTS entrega_status CASCADE;
DROP TYPE IF EXISTS loja_status_assinatura CASCADE;
DROP TYPE IF EXISTS saque_status CASCADE;

-- =============================================================================
-- CRIAÇÃO DA ESTRUTURA
-- =============================================================================

-- 4. Tipos e Enums
CREATE TYPE user_role AS ENUM ('super_admin', 'lojista', 'entregador', 'cliente');
CREATE TYPE entregador_status AS ENUM ('disponível', 'ocupado', 'em_pausa', 'suspenso');
CREATE TYPE entrega_status AS ENUM ('pendente', 'preparando', 'pronto', 'em_transito', 'finalizada', 'cancelada');
CREATE TYPE loja_status_assinatura AS ENUM ('ativo', 'cancelado', 'teste');
CREATE TYPE saque_status AS ENUM ('processando', 'pago', 'recusado');

-- 5. Tabela de Perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'lojista',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Planos
CREATE TABLE planos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  limite_pedidos INT DEFAULT 0,
  limite_entregadores INT DEFAULT 0,
  recursos TEXT[] DEFAULT '{}',
  cor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Lojas
CREATE TABLE lojas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id),
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

-- 8. Produtos
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  imagem_url TEXT,
  categoria TEXT NOT NULL,
  disponivel BOOLEAN DEFAULT TRUE,
  destaque BOOLEAN DEFAULT FALSE,
  mais_vendido BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Entregadores
CREATE TABLE entregadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  status entregador_status DEFAULT 'disponível',
  saldo DECIMAL(10, 2) DEFAULT 0.00,
  entregas_hoje INT DEFAULT 0,
  entregas_total INT DEFAULT 0,
  nivel TEXT DEFAULT 'Bronze',
  xp INT DEFAULT 0,
  tipo_veiculo TEXT DEFAULT 'Moto',
  data_adesao TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Entregas
CREATE TABLE entregas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  entregador_id UUID REFERENCES entregadores(id),
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  endereco_entrega TEXT,
  tipo_entrega TEXT DEFAULT 'entrega',
  itens JSONB NOT NULL,
  valor_total DECIMAL(10, 2) NOT NULL,
  taxa_entrega_aplicada DECIMAL(10, 2) DEFAULT 0.00,
  metodo_pagamento TEXT,
  status entrega_status DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Saques
CREATE TABLE saques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entregador_id UUID REFERENCES entregadores(id) ON DELETE CASCADE NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  status saque_status DEFAULT 'processando',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TRIGGER DE AUTOMAÇÃO (CRIAÇÃO DE USUÁRIO)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'nome', 'Novo Usuário'), 
    CASE 
        WHEN new.email = 'joaocarlostuc75@gmail.com' THEN 'super_admin'::user_role
        ELSE COALESCE((new.raw_user_meta_data->>'role')::user_role, 'lojista'::user_role)
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    role = CASE 
        WHEN EXCLUDED.email = 'joaocarlostuc75@gmail.com' THEN 'super_admin'::user_role
        ELSE EXCLUDED.role
    END;
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE saques ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICAS DO SUPER ADMIN (Acesso Universal)

CREATE POLICY "Super Admin: Manage Profiles" ON profiles FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super Admin: Manage Planos" ON planos FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super Admin: Manage Lojas" ON lojas FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super Admin: Manage Produtos" ON produtos FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super Admin: Manage Entregadores" ON entregadores FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super Admin: Manage Entregas" ON entregas FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);
CREATE POLICY "Super Admin: Manage Saques" ON saques FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
);

-- 2. POLÍTICAS DE USUÁRIOS COMUNS

-- Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Planos
CREATE POLICY "Public read plans" ON planos FOR SELECT USING (true);

-- Lojas
CREATE POLICY "Public view lojas" ON lojas FOR SELECT USING (true);
CREATE POLICY "Lojista update own loja" ON lojas FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Lojista insert loja" ON lojas FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Produtos
CREATE POLICY "Public view produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Lojista manage produtos" ON produtos FOR ALL USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = produtos.loja_id AND lojas.owner_id = auth.uid())
);

-- Entregadores
CREATE POLICY "Lojista manage entregadores" ON entregadores FOR ALL USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregadores.loja_id AND lojas.owner_id = auth.uid())
);
CREATE POLICY "Entregador view self" ON entregadores FOR SELECT USING (user_id = auth.uid());

-- Entregas
CREATE POLICY "Anon create pedidos" ON entregas FOR INSERT WITH CHECK (true);
CREATE POLICY "Lojista view pedidos" ON entregas FOR SELECT USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregas.loja_id AND lojas.owner_id = auth.uid())
);
CREATE POLICY "Lojista update pedidos" ON entregas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregas.loja_id AND lojas.owner_id = auth.uid())
);
CREATE POLICY "Entregador view assigned" ON entregas FOR SELECT USING (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = entregas.entregador_id AND entregadores.user_id = auth.uid())
);
CREATE POLICY "Entregador update assigned" ON entregas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = entregas.entregador_id AND entregadores.user_id = auth.uid())
);

-- Saques
CREATE POLICY "Entregador view saques" ON saques FOR SELECT USING (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = saques.entregador_id AND entregadores.user_id = auth.uid())
);
CREATE POLICY "Entregador insert saques" ON saques FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = saques.entregador_id AND entregadores.user_id = auth.uid())
);
CREATE POLICY "Lojista view saques" ON saques FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM entregadores 
    JOIN lojas ON lojas.id = entregadores.loja_id
    WHERE entregadores.id = saques.entregador_id AND lojas.owner_id = auth.uid()
  )
);

-- =============================================================================
-- INSERÇÃO DE DADOS INICIAIS (PLANOS PADRÃO)
-- =============================================================================
INSERT INTO planos (nome, preco, limite_pedidos, limite_entregadores, recursos, cor) VALUES
('Básico', 99.90, 500, 5, '{WhatsApp Pay, Cardápio Digital, Suporte Email}', 'bg-gray-100'),
('Pro Amazônia', 199.90, 1000, 10, '{Suporte 24/7, Dashboard Avançado, Roteirização}', 'bg-emerald-600'),
('Enterprise', 499.90, 99999, 999, '{Gerente Dedicado, API, White Label}', 'bg-purple-600');

-- =============================================================================
-- GARANTIA FINAL PARA USUÁRIO EXISTENTE
-- =============================================================================
-- Caso o usuário já tenha sido criado no Auth antes de rodar este script,
-- tentamos inserir o perfil dele agora manualmente, pois o trigger não rodou lá atrás.
INSERT INTO profiles (id, email, nome, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'nome', 'Super Admin'), 'super_admin'
FROM auth.users
WHERE email = 'joaocarlostuc75@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
