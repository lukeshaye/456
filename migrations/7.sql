-- HABILITAR RLS PARA CADA TABELA
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_exceptions ENABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM) PARA GARANTIR UM ESTADO LIMPO
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.clients;
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.products;
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.professionals;
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.appointments;
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.financial_entries;
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.business_settings;
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.business_exceptions;

-- CRIAR NOVAS POLÍTICAS DE SEGURANÇA
-- A função auth.uid() retorna o ID do usuário atualmente autenticado.
-- Esta política permite todas as ações (SELECT, INSERT, UPDATE, DELETE)
-- apenas se o user_id da linha for igual ao ID do usuário logado.

CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.clients
    FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.products
    FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.professionals
    FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.appointments
    FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.financial_entries
    FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.business_settings
    FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.business_exceptions
    FOR ALL USING (auth.uid() = user_id::uuid);
