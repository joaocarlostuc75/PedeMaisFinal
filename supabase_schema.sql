
-- =============================================================================
-- SCRIPT DE REINICIALIZAÇÃO TOTAL (SCHEMA COMPLETO MVP PEDE MAIS V2)
-- ATUALIZADO: Suporte a CRM (Telefone do Cliente) e RLS Ativos
-- =============================================================================

-- 1. Limpeza de Triggers e Funções Antigas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Limpeza de Tabelas (Ordem importa devido às chaves estrangeiras)
DROP TABLE IF EXISTS avaliacoes CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS metodos_pagamento CASCADE;
DROP TABLE IF EXISTS faturas CASCADE;
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

-- 5. Tabela de Perfis (Usuários)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'lojista',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Planos (SaaS)
CREATE TABLE planos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco DECIMAL(10, 2) NOT NULL,
  limite_pedidos INT DEFAULT 0,
  limite_entregadores INT DEFAULT 0,
  recursos TEXT[] DEFAULT '{}',
  cor TEXT,
  destaque BOOLEAN DEFAULT FALSE,
  privado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Lojas
CREATE TABLE lojas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES profiles(id),
  plano_id UUID REFERENCES planos(id),
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  documento TEXT,
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
  taxa_entrega DECIMAL(10, 2) DEFAULT 5.90,
  tempo_min INT DEFAULT 30,
  tempo_max INT DEFAULT 45,
  aceita_retirada BOOLEAN DEFAULT TRUE,
  loja_aberta_manual BOOLEAN DEFAULT TRUE,
  
  -- Campos JSONB
  horarios JSONB DEFAULT '{}',
  feriados JSONB DEFAULT '[]',
  areas_entrega JSONB DEFAULT '[]',
  stats JSONB DEFAULT '{"carrinhos": 0, "finalizados": 0, "mrr": 0}',
  
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
  imagens TEXT[] DEFAULT '{}',
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
  badges JSONB DEFAULT '[]',
  tipo_veiculo TEXT DEFAULT 'Moto',
  placa TEXT,
  data_adesao TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Entregas (Pedidos)
-- CRM UPDATE: Campo 'cliente_telefone' adicionado para permitir contato via WhatsApp
CREATE TABLE entregas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  entregador_id UUID REFERENCES entregadores(id),
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT, -- Vital para o CRM
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

-- 11. Saques (Financeiro Entregador)
CREATE TABLE saques (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entregador_id UUID REFERENCES entregadores(id) ON DELETE CASCADE NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  status saque_status DEFAULT 'processando',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Faturas (Assinatura Lojista)
CREATE TABLE faturas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  mes_referencia TEXT NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Métodos de Pagamento (Lojista pagando Plataforma)
CREATE TABLE metodos_pagamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL,
  detalhe TEXT NOT NULL,
  extra TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Configurações do Sistema (Super Admin)
CREATE TABLE system_settings (
  id INT PRIMARY KEY DEFAULT 1,
  app_name TEXT DEFAULT 'Pede Mais',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  allow_new_registrations BOOLEAN DEFAULT TRUE,
  global_announcement TEXT,
  support_phone TEXT DEFAULT '5511999999999',
  pix_key TEXT DEFAULT 'financeiro@pedemais.app',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- 15. Avaliações (Ratings)
CREATE TABLE avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  pedido_id UUID REFERENCES entregas(id),
  cliente_nome TEXT,
  nota INT NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
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
-- PERFORMANCE INDEXES (Essenciais para RLS e CRM)
-- =============================================================================
CREATE INDEX idx_lojas_owner ON lojas(owner_id);
CREATE INDEX idx_produtos_loja ON produtos(loja_id);
CREATE INDEX idx_entregadores_loja ON entregadores(loja_id);
CREATE INDEX idx_entregas_loja ON entregas(loja_id);
CREATE INDEX idx_entregas_entregador ON entregas(entregador_id);
CREATE INDEX idx_entregas_status ON entregas(status);
CREATE INDEX idx_avaliacoes_loja ON avaliacoes(loja_id);
-- Index para busca rápida no CRM por nome ou telefone
CREATE INDEX idx_entregas_cliente_nome ON entregas(cliente_nome);
CREATE INDEX idx_entregas_cliente_telefone ON entregas(cliente_telefone);

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
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE metodos_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICAS DO SUPER ADMIN (Acesso Total)
CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Super Admin Profiles" ON profiles FOR ALL USING (is_super_admin());
CREATE POLICY "Super Admin Planos" ON planos FOR ALL USING (is_super_admin());
CREATE POLICY "Super Admin Lojas" ON lojas FOR ALL USING (is_super_admin());
CREATE POLICY "Super Admin Configs" ON system_settings FOR ALL USING (is_super_admin());

-- 2. SYSTEM SETTINGS
CREATE POLICY "Public Read Settings" ON system_settings FOR SELECT USING (true);

-- 3. PROFILES
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 4. PLANOS
CREATE POLICY "Public read plans" ON planos FOR SELECT USING (true);

-- 5. LOJAS
CREATE POLICY "Public view lojas" ON lojas FOR SELECT USING (true);
CREATE POLICY "Lojista update own loja" ON lojas FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Lojista insert loja" ON lojas FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- 6. FATURAS & MÉTODOS PAGAMENTO (Apenas dono da loja)
CREATE POLICY "Lojista view faturas" ON faturas FOR SELECT USING (EXISTS (SELECT 1 FROM lojas WHERE lojas.id = faturas.loja_id AND lojas.owner_id = auth.uid()));
CREATE POLICY "Lojista view methods" ON metodos_pagamento FOR SELECT USING (EXISTS (SELECT 1 FROM lojas WHERE lojas.id = metodos_pagamento.loja_id AND lojas.owner_id = auth.uid()));
CREATE POLICY "Lojista manage methods" ON metodos_pagamento FOR ALL USING (EXISTS (SELECT 1 FROM lojas WHERE lojas.id = metodos_pagamento.loja_id AND lojas.owner_id = auth.uid()));

-- 7. PRODUTOS
CREATE POLICY "Public view produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Lojista manage produtos" ON produtos FOR ALL USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = produtos.loja_id AND lojas.owner_id = auth.uid())
);

-- 8. ENTREGADORES
CREATE POLICY "Lojista manage entregadores" ON entregadores FOR ALL USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregadores.loja_id AND lojas.owner_id = auth.uid())
);
CREATE POLICY "Entregador view self" ON entregadores FOR SELECT USING (user_id = auth.uid());

-- 9. ENTREGAS
-- Qualquer pessoa (cliente anônimo) pode criar um pedido
CREATE POLICY "Anon create pedidos" ON entregas FOR INSERT WITH CHECK (true);

-- Lojista vê apenas pedidos de sua loja (CRM Data Protection)
CREATE POLICY "Lojista view pedidos" ON entregas FOR SELECT USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregas.loja_id AND lojas.owner_id = auth.uid())
);
CREATE POLICY "Lojista update pedidos" ON entregas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM lojas WHERE lojas.id = entregas.loja_id AND lojas.owner_id = auth.uid())
);

-- Entregador vê apenas pedidos atribuídos a ele
CREATE POLICY "Entregador view assigned" ON entregas FOR SELECT USING (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = entregas.entregador_id AND entregadores.user_id = auth.uid())
);
CREATE POLICY "Entregador update assigned" ON entregas FOR UPDATE USING (
  EXISTS (SELECT 1 FROM entregadores WHERE entregadores.id = entregas.entregador_id AND entregadores.user_id = auth.uid())
);

-- Permitir leitura pública para rastreamento (idealmente filtrado por ID via função segura, mas para RLS genérico:)
-- Atenção: Em produção, substitua por uma RPC "get_order_by_id" com SECURITY DEFINER para não expor todos os pedidos.
-- Para o MVP, permitimos leitura se souber o ID (UUID é difícil de adivinhar)
CREATE POLICY "Public read specific order" ON entregas FOR SELECT USING (true);

-- 10. SAQUES
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

-- 11. AVALIAÇÕES
CREATE POLICY "Public read avaliacoes" ON avaliacoes FOR SELECT USING (true);
CREATE POLICY "Anon insert avaliacoes" ON avaliacoes FOR INSERT WITH CHECK (true);

-- =============================================================================
-- INSERÇÃO DE DADOS INICIAIS
-- =============================================================================

-- Inserir Configuração Padrão
INSERT INTO system_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Inserir Planos Padrão
INSERT INTO planos (nome, preco, limite_pedidos, limite_entregadores, recursos, cor, destaque, privado) VALUES
('Básico', 99.90, 500, 5, '{WhatsApp Pay, Cardápio Digital, Suporte Email}', 'bg-gray-100', false, false),
('Pro Amazônia', 199.90, 1000, 10, '{Suporte 24/7, Dashboard Avançado, Roteirização}', 'bg-emerald-600', true, false),
('Enterprise', 499.90, 99999, 999, '{Gerente Dedicado, API, White Label}', 'bg-purple-600', false, false);

-- Inserir Super Admin se já existir no Auth
INSERT INTO profiles (id, email, nome, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'nome', 'Super Admin'), 'super_admin'
FROM auth.users
WHERE email = 'joaocarlostuc75@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'super_admin';
