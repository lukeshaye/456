-- HABILITAR RLS PARA TABELAS FALTANTES
ALTER TABLE public.professional_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_exceptions ENABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS ANTIGAS (SE EXISTIREM) PARA GARANTIR UM ESTADO LIMPO
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.professional_schedules;
DROP POLICY IF EXISTS "Usuários podem acessar seus próprios dados." ON public.professional_exceptions;

-- CRIAR POLÍTICAS PARA AS TABELAS FALTANTES
CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.professional_schedules
    FOR ALL USING (auth.uid() = user_id::uuid);

CREATE POLICY "Usuários podem acessar seus próprios dados." ON public.professional_exceptions
    FOR ALL USING (auth.uid() = user_id::uuid);

-- AJUSTAR VIEWS PARA RESPEITAR AS POLÍTICAS DE RLS
-- O 'security_invoker' faz com que a view seja executada com as permissões do usuário que a está a consultar.
ALTER VIEW public.v_appointments_complete SET (security_invoker = true);
ALTER VIEW public.v_financial_summary SET (security_invoker = true);
