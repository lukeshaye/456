-- =====================================================
-- MIGRAÇÃO 3: INTEGRAÇÃO COMPLETA DAS MELHORIAS
-- =====================================================
-- Este script cria todas as tabelas necessárias para o SalonFlow
-- com as melhorias implementadas (gestão de profissionais, etc.)

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de profissionais
CREATE TABLE IF NOT EXISTS professionals (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- preço em centavos
  quantity INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  client_id INTEGER NOT NULL, -- Referência ao cliente
  client_name TEXT NOT NULL, -- Mantido para compatibilidade
  service TEXT NOT NULL,
  price INTEGER NOT NULL, -- preço em centavos
  professional TEXT NOT NULL, -- Nome do profissional (mantido para compatibilidade)
  professional_id INTEGER, -- Referência ao profissional (opcional)
  appointment_date TIMESTAMP NOT NULL,
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Chaves estrangeiras
  CONSTRAINT fk_appointments_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL
);

-- Tabela de lançamentos financeiros
CREATE TABLE IF NOT EXISTS financial_entries (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL, -- valor em centavos
  type TEXT NOT NULL CHECK (type IN ('receita', 'despesa')),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('pontual', 'fixa')),
  entry_date DATE NOT NULL,
  is_virtual BOOLEAN DEFAULT false, -- se foi gerado automaticamente por agendamento
  appointment_id INTEGER, -- Referência ao agendamento que gerou a entrada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Chave estrangeira
  CONSTRAINT fk_financial_entries_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- =====================================================
-- TABELAS DE CONFIGURAÇÃO E HORÁRIOS
-- =====================================================

-- Tabela de horários dos profissionais
CREATE TABLE IF NOT EXISTS professional_schedules (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  professional_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 1=segunda, etc
  start_time TIME, -- formato HH:MM
  end_time TIME, -- formato HH:MM
  lunch_start_time TIME, -- formato HH:MM
  lunch_end_time TIME, -- formato HH:MM
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Chave estrangeira
  CONSTRAINT fk_professional_schedules_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
  -- Índice único para evitar horários duplicados
  UNIQUE(professional_id, day_of_week)
);

-- Tabela de exceções e férias dos profissionais
CREATE TABLE IF NOT EXISTS professional_exceptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  professional_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME, -- formato HH:MM (null se dia inteiro)
  end_time TIME, -- formato HH:MM (null se dia inteiro)
  description TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false, -- se é uma exceção recorrente (ex: toda segunda-feira)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Chave estrangeira
  CONSTRAINT fk_professional_exceptions_professional FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
  -- Validação de datas
  CONSTRAINT chk_professional_exceptions_dates CHECK (end_date >= start_date)
);

-- Tabela de configurações gerais do estabelecimento
CREATE TABLE IF NOT EXISTS business_settings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=domingo, 1=segunda, etc
  start_time TIME, -- formato HH:MM
  end_time TIME, -- formato HH:MM
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Índice único para evitar configurações duplicadas
  UNIQUE(user_id, day_of_week)
);

-- Tabela de exceções do estabelecimento
CREATE TABLE IF NOT EXISTS business_exceptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  exception_date DATE NOT NULL,
  start_time TIME, -- formato HH:MM (null se fechado)
  end_time TIME, -- formato HH:MM (null se fechado)
  description TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT false, -- se é uma exceção recorrente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  -- Índice único para evitar exceções duplicadas
  UNIQUE(user_id, exception_date)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Índices para profissionais
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_name ON professionals(name);

-- Índices para produtos
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Índices para agendamentos
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_appointments_confirmed ON appointments(is_confirmed);

-- Índices para entradas financeiras
CREATE INDEX IF NOT EXISTS idx_financial_entries_user_id ON financial_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_date ON financial_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_financial_entries_type ON financial_entries(type);
CREATE INDEX IF NOT EXISTS idx_financial_entries_appointment_id ON financial_entries(appointment_id);

-- Índices para horários dos profissionais
CREATE INDEX IF NOT EXISTS idx_professional_schedules_user_id ON professional_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_schedules_professional_id ON professional_schedules(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_schedules_day ON professional_schedules(day_of_week);

-- Índices para exceções dos profissionais
CREATE INDEX IF NOT EXISTS idx_professional_exceptions_user_id ON professional_exceptions(user_id);
CREATE INDEX IF NOT EXISTS idx_professional_exceptions_professional_id ON professional_exceptions(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_exceptions_dates ON professional_exceptions(start_date, end_date);

-- Índices para configurações do estabelecimento
CREATE INDEX IF NOT EXISTS idx_business_settings_user_id ON business_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_day ON business_settings(day_of_week);

-- Índices para exceções do estabelecimento
CREATE INDEX IF NOT EXISTS idx_business_exceptions_user_id ON business_exceptions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_exceptions_date ON business_exceptions(exception_date);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA DE TIMESTAMPS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professionals_updated_at BEFORE UPDATE ON professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_financial_entries_updated_at BEFORE UPDATE ON financial_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_schedules_updated_at BEFORE UPDATE ON professional_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_professional_exceptions_updated_at BEFORE UPDATE ON professional_exceptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_exceptions_updated_at BEFORE UPDATE ON business_exceptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS ÚTEIS PARA CONSULTAS COMPLEXAS
-- =====================================================

-- View para agendamentos com informações completas
CREATE OR REPLACE VIEW v_appointments_complete AS
SELECT 
  a.id,
  a.user_id,
  a.client_id,
  c.name as client_name,
  c.phone as client_phone,
  c.email as client_email,
  a.service,
  a.price,
  a.professional,
  p.name as professional_name,
  a.appointment_date,
  a.is_confirmed,
  a.created_at,
  a.updated_at
FROM appointments a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN professionals p ON a.professional_id = p.id;

-- View para relatórios financeiros
CREATE OR REPLACE VIEW v_financial_summary AS
SELECT 
  user_id,
  DATE_TRUNC('month', entry_date) as month,
  type,
  SUM(amount) as total_amount,
  COUNT(*) as entry_count
FROM financial_entries
GROUP BY user_id, DATE_TRUNC('month', entry_date), type;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE clients IS 'Tabela de clientes do salão';
COMMENT ON TABLE professionals IS 'Tabela de profissionais do salão';
COMMENT ON TABLE products IS 'Tabela de produtos/serviços oferecidos';
COMMENT ON TABLE appointments IS 'Tabela de agendamentos de clientes';
COMMENT ON TABLE financial_entries IS 'Tabela de entradas financeiras (receitas e despesas)';
COMMENT ON TABLE professional_schedules IS 'Tabela de horários de trabalho dos profissionais';
COMMENT ON TABLE professional_exceptions IS 'Tabela de exceções e férias dos profissionais';
COMMENT ON TABLE business_settings IS 'Tabela de configurações de horário do estabelecimento';
COMMENT ON TABLE business_exceptions IS 'Tabela de exceções de horário do estabelecimento';

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Inserir configurações padrão para cada dia da semana (opcional)
-- INSERT INTO business_settings (user_id, day_of_week, start_time, end_time) VALUES
-- ('default', 1, '09:00', '18:00'), -- Segunda-feira
-- ('default', 2, '09:00', '18:00'), -- Terça-feira
-- ('default', 3, '09:00', '18:00'), -- Quarta-feira
-- ('default', 4, '09:00', '18:00'), -- Quinta-feira
-- ('default', 5, '09:00', '18:00'), -- Sexta-feira
-- ('default', 6, '09:00', '16:00'); -- Sábado
