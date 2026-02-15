
-- =============================================================================
-- ESTRUTURA V2.1: SISTEMA DE FUNCIONÁRIOS E PERMISSÕES (RBAC)
-- =============================================================================

-- 1. Limpeza (Opcional, cuidado em produção)
-- DROP TABLE IF EXISTS funcionarios CASCADE;
-- DROP TYPE IF EXISTS funcionario_cargo;

-- 2. Tipos e Enums
CREATE TYPE funcionario_cargo AS ENUM ('Gerente', 'Atendente', 'Cozinha', 'Entregador Fixo');

-- 3. Tabela de Funcionários
-- Esta tabela atua como uma "tabela de ligação" com permissões granulares
CREATE TABLE funcionarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id), -- Vinculado quando o usuário cria conta
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cargo funcionario_cargo NOT NULL DEFAULT 'Atendente',
  permissoes TEXT[] DEFAULT '{}', -- Ex: ['ver_dashboard', 'gerir_pedidos']
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garante unicidade: um email só pode ser funcionário de uma loja específica uma vez
  UNIQUE(loja_id, email)
);

-- 4. Índices para Performance
CREATE INDEX idx_funcionarios_loja ON funcionarios(loja_id);
CREATE INDEX idx_funcionarios_user ON funcionarios(user_id);
CREATE INDEX idx_funcionarios_email ON funcionarios(email);

-- 5. Habilitar Segurança em Nível de Linha (RLS)
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- FUNÇÕES DE SEGURANÇA (SECURITY DEFINER)
-- Estas funções bypassam o RLS para verificar permissões sem expor dados
-- =============================================================================

-- Verifica se o usuário atual é o DONO da loja
CREATE OR REPLACE FUNCTION is_loja_owner(target_loja_id UUID) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM lojas 
    WHERE id = target_loja_id 
    AND owner_id = auth.uid() -- auth.uid() é o usuário logado
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Verifica se o usuário atual é um FUNCIONÁRIO ATIVO com a PERMISSÃO X
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
-- POLÍTICAS DE ACESSO (RLS) - TABELA FUNCIONARIOS
-- =============================================================================

-- Política 1: O Dono da Loja pode Ver, Criar, Editar e Deletar seus funcionários
CREATE POLICY "Lojista manage employees" ON funcionarios
FOR ALL
USING (is_loja_owner(loja_id));

-- Política 2: O Funcionário pode ver seus próprios dados (para checar permissões no front)
CREATE POLICY "Employee view self" ON funcionarios
FOR SELECT
USING (user_id = auth.uid());

-- =============================================================================
-- INTEGRAÇÃO COM OUTRAS TABELAS (COMO APLICAR AS PERMISSÕES)
-- =============================================================================

-- A. PEDIDOS (Entregas)
-- Regra: Dono VÊ/EDITA OU Funcionário com 'gerir_pedidos' VÊ/EDITA
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Pedidos" ON entregas
FOR ALL
USING (
  is_loja_owner(loja_id) OR has_permission(loja_id, 'gerir_pedidos')
);

-- B. CARDÁPIO (Produtos)
-- Regra: Dono VÊ/EDITA OU Funcionário com 'gerir_cardapio' VÊ/EDITA
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Produtos" ON produtos
FOR ALL
USING (
  is_loja_owner(loja_id) OR has_permission(loja_id, 'gerir_cardapio')
);

-- C. FINANCEIRO (Faturas/Saques)
-- Regra: Apenas Dono OU Funcionário com 'ver_financeiro'
ALTER TABLE faturas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso Financeiro" ON faturas
FOR SELECT
USING (
  is_loja_owner(loja_id) OR has_permission(loja_id, 'ver_financeiro')
);

-- D. CONFIGURAÇÕES DA LOJA
-- Regra: Apenas Dono OU Funcionário com 'configuracoes_loja'
-- Nota: Isso se aplica para UPDATE na tabela lojas
CREATE POLICY "Update Loja Settings" ON lojas
FOR UPDATE
USING (
  owner_id = auth.uid() OR has_permission(id, 'configuracoes_loja')
);

-- =============================================================================
-- TRIGGER AUTOMÁTICO: VINCULAR USUÁRIO AO CRIAR CONTA
-- =============================================================================

CREATE OR REPLACE FUNCTION public.link_funcionario_on_signup()
RETURNS trigger AS $$
BEGIN
  -- Se alguém cadastrou este email como funcionário antes da pessoa criar a conta,
  -- agora vinculamos o ID do novo usuário àquele registro de funcionário.
  UPDATE public.funcionarios
  SET user_id = new.id
  WHERE email = new.email;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger dispara após inserção na tabela auth.users (Supabase Auth)
DROP TRIGGER IF EXISTS on_auth_user_link_funcionario ON auth.users;
CREATE TRIGGER on_auth_user_link_funcionario
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.link_funcionario_on_signup();
