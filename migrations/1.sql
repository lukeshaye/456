-- Tabela de agendamentos
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  service TEXT NOT NULL,
  price INTEGER NOT NULL, -- preço em centavos
  professional TEXT NOT NULL,
  appointment_date TIMESTAMP NOT NULL,
  is_confirmed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de lançamentos financeiros
CREATE TABLE financial_entries (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL, -- valor em centavos
  type TEXT NOT NULL, -- 'receita' ou 'despesa'
  entry_type TEXT NOT NULL, -- 'pontual' ou 'fixa'
  entry_date DATE NOT NULL,
  is_virtual BOOLEAN DEFAULT false, -- se foi gerado automaticamente por agendamento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- preço em centavos
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de profissionais
CREATE TABLE professionals (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de horários dos profissionais
CREATE TABLE professional_schedules (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  professional_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=domingo, 1=segunda, etc
  start_time TIME, -- formato HH:MM
  end_time TIME, -- formato HH:MM
  lunch_start_time TIME, -- formato HH:MM
  lunch_end_time TIME, -- formato HH:MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de exceções e férias dos profissionais
CREATE TABLE professional_exceptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  professional_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME, -- formato HH:MM (null se dia inteiro)
  end_time TIME, -- formato HH:MM (null se dia inteiro)
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações gerais
CREATE TABLE business_settings (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=domingo, 1=segunda, etc
  start_time TIME, -- formato HH:MM
  end_time TIME, -- formato HH:MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de exceções do estabelecimento
CREATE TABLE business_exceptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  exception_date DATE NOT NULL,
  start_time TIME, -- formato HH:MM (null se fechado)
  end_time TIME, -- formato HH:MM (null se fechado)
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_financial_entries_user_id ON financial_entries(user_id);
CREATE INDEX idx_financial_entries_date ON financial_entries(entry_date);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professional_schedules_user_id ON professional_schedules(user_id);
CREATE INDEX idx_professional_schedules_professional_id ON professional_schedules(professional_id);
CREATE INDEX idx_professional_exceptions_user_id ON professional_exceptions(user_id);
CREATE INDEX idx_professional_exceptions_professional_id ON professional_exceptions(professional_id);
CREATE INDEX idx_business_settings_user_id ON business_settings(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS business_settings_user_id_day_of_week_idx ON business_settings (user_id, day_of_week);
CREATE INDEX idx_business_exceptions_user_id ON business_exceptions(user_id);