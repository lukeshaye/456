-- Criação da tabela de clientes
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona a coluna de quantidade à tabela de produtos
ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 0;

-- Cria um índice na nova tabela de clientes para otimizar as buscas por user_id
CREATE INDEX idx_clients_user_id ON clients(user_id);