-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- preço em centavos
  duration INTEGER NOT NULL, -- duração em minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);

-- Trigger para auto-atualizar 'updated_at'
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Adicionar a política de Row Level Security (RLS)
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuários podem acessar seus próprios serviços." ON public.services
    FOR ALL USING (auth.uid() = user_id::uuid);