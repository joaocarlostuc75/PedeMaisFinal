
-- =============================================================================
-- ATUALIZAÇÃO V2.1: MÓDULO DE FUNCIONÁRIOS E PERMISSÕES (RBAC)
-- =============================================================================

-- 1. Novos Tipos
CREATE TYPE funcionario_cargo AS ENUM ('Gerente', 'Atendente', 'Cozinha', 'Entregador Fixo');

-- 2. Tabela de Funcionários
-- Vincula um usuário (auth.users) a uma loja com permissões específicas
CREATE TABLE funcionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id), -- Pode ser NULL até o funcionário criar a conta
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cargo funcionario_cargo NOT NULL DEFAULT 'Atendente',
  permissoes TEXT[] DEFAULT '{}', -- Array de strings: ['ver_dashboard', 'gerir_pedidos', etc]
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garante que um email só possa ser funcionário de uma loja específica uma vez (evita duplicatas na mesma loja)
  UNIQUE(loja_id, email)
);

-- 3. Índices de Performance
CREATE INDEX idx_funcionarios_loja ON funcionarios(loja_id);
CREATE INDEX idx_funcionarios_user ON funcionarios(user_id);
CREATE INDEX idx_funcionarios_email ON funcionarios(email);

-- 4. Habilitar RLS na nova tabela
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FUNÇÕES AUXILIARES DE SEGURANÇA (SECURITY DEFINER)
-- =============================================================================

-- Função para verificar se o usuário atual é dono da loja
CREATE OR REPLACE FUNCTION is_loja_owner(target_loja_id UUID) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lojas 
    WHERE id = target_loja_id AND owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Função poderosa para verificar permissões do funcionário
-- Retorna TRUE se o usuário atual for funcionário da loja, estiver ativo E tiver a permissão solicitada
CREATE OR REPLACE FUNCTION has_permission(target_loja_id UUID, required_permission TEXT) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM funcionarios 
    WHERE loja_id = target_loja_id 
      AND user_id = auth.uid() 
      AND ativo = TRUE 
      AND required_permission = ANY(permissoes)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================================================
-- POLÍTICAS DE SEGURANÇA (RLS) PARA FUNCIONÁRIOS
-- =============================================================================

-- A. O Dono da Loja pode fazer TUDO na tabela de seus funcionários
CREATE POLICY "Lojista manage employees" ON funcionarios
FOR ALL
USING (is_loja_owner(loja_id));

-- B. O próprio funcionário pode ver seus dados (para saber suas permissões)
CREATE POLICY "Employee view self" ON funcionarios
FOR SELECT
USING (user_id = auth.uid());

-- =============================================================================
-- ATUALIZAÇÃO DAS POLÍTICAS EXISTENTES (INTEGRAÇÃO COM FUNCIONÁRIOS)
-- =============================================================================

-- 1. ATUALIZAR ENTREGAS (PEDIDOS)
-- Remove política antiga restrita apenas ao dono
DROP POLICY IF EXISTS "Lojista view pedidos" ON entregas;
DROP POLICY IF EXISTS "Lojista update pedidos" ON entregas;

-- Nova política: Dono VÊ OU Funcionário com permissão 'gerir_pedidos' VÊ
CREATE POLICY "Equipe view pedidos" ON entregas FOR SELECT USING (
  is_loja_owner(loja_id) OR has_permission(loja_id, 'gerir_pedidos')
);

-- Nova política: Dono EDITA OU Funcionário com permissão 'gerir_pedidos' EDITA
CREATE POLICY "Equipe update pedidos" ON entregas FOR UPDATE USING (
  is_loja_owner(loja_id) OR has_permission(loja_id, 'gerir_pedidos')
);

-- 2. ATUALIZAR PRODUTOS (CARDÁPIO)
DROP POLICY IF EXISTS "Lojista manage produtos" ON produtos;

CREATE POLICY "Equipe manage produtos" ON produtos FOR ALL USING (
  is_loja_owner(loja_id) OR has_permission(loja_id, 'gerir_cardapio')
);

-- 3. ATUALIZAR ENTREGADORES (FROTA)
DROP POLICY IF EXISTS "Lojista manage entregadores" ON entregadores;

CREATE POLICY "Equipe manage entregadores" ON entregadores FOR ALL USING (
  is_loja_owner(loja_id) OR has_permission(loja_id, 'gerir_entregadores')
);

-- 4. ATUALIZAR FINANCEIRO (FATURAS E MÉTODOS)
-- Apenas gerente ou dono acessam financeiro
DROP POLICY IF EXISTS "Lojista view faturas" ON faturas;
CREATE POLICY "Equipe view faturas" ON faturas FOR SELECT USING (
  is_loja_owner(loja_id) OR has_permission(loja_id, 'ver_financeiro')
);

-- =============================================================================
-- AUTOMAÇÃO: VINCULAR USUÁRIO AO FUNCIONÁRIO AO CRIAR CONTA
-- =============================================================================

CREATE OR REPLACE FUNCTION public.link_funcionario_on_signup()
RETURNS trigger AS $$
BEGIN
  -- Se houver um registro de funcionário com este email (convite pendente), vincula o ID
  UPDATE public.funcionarios
  SET user_id = new.id
  WHERE email = new.email;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger disparado sempre que um usuário confirma o cadastro no Auth
DROP TRIGGER IF EXISTS on_auth_user_link_funcionario ON auth.users;
CREATE TRIGGER on_auth_user_link_funcionario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.link_funcionario_on_signup();

