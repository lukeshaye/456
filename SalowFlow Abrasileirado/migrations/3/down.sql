-- =====================================================
-- ROLLBACK DA MIGRAÇÃO 3: INTEGRAÇÃO COMPLETA DAS MELHORIAS
-- =====================================================
-- Este script remove todas as tabelas criadas na migração 3

-- =====================================================
-- REMOVER TRIGGERS PRIMEIRO
-- =====================================================

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
DROP TRIGGER IF EXISTS update_professionals_updated_at ON professionals;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
DROP TRIGGER IF EXISTS update_financial_entries_updated_at ON financial_entries;
DROP TRIGGER IF EXISTS update_professional_schedules_updated_at ON professional_schedules;
DROP TRIGGER IF EXISTS update_professional_exceptions_updated_at ON professional_exceptions;
DROP TRIGGER IF EXISTS update_business_settings_updated_at ON business_settings;
DROP TRIGGER IF EXISTS update_business_exceptions_updated_at ON business_exceptions;

-- =====================================================
-- REMOVER FUNÇÃO DE TRIGGER
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column();

-- =====================================================
-- REMOVER VIEWS
-- =====================================================

DROP VIEW IF EXISTS v_appointments_complete;
DROP VIEW IF EXISTS v_financial_summary;

-- =====================================================
-- REMOVER ÍNDICES
-- =====================================================

-- Índices de clientes
DROP INDEX IF EXISTS idx_clients_user_id;
DROP INDEX IF EXISTS idx_clients_name;

-- Índices de profissionais
DROP INDEX IF EXISTS idx_professionals_user_id;
DROP INDEX IF EXISTS idx_professionals_name;

-- Índices de produtos
DROP INDEX IF EXISTS idx_products_user_id;
DROP INDEX IF EXISTS idx_products_name;

-- Índices de agendamentos
DROP INDEX IF EXISTS idx_appointments_user_id;
DROP INDEX IF EXISTS idx_appointments_date;
DROP INDEX IF EXISTS idx_appointments_client_id;
DROP INDEX IF EXISTS idx_appointments_professional_id;
DROP INDEX IF EXISTS idx_appointments_confirmed;

-- Índices de entradas financeiras
DROP INDEX IF EXISTS idx_financial_entries_user_id;
DROP INDEX IF EXISTS idx_financial_entries_date;
DROP INDEX IF EXISTS idx_financial_entries_type;
DROP INDEX IF EXISTS idx_financial_entries_appointment_id;

-- Índices de horários dos profissionais
DROP INDEX IF EXISTS idx_professional_schedules_user_id;
DROP INDEX IF EXISTS idx_professional_schedules_professional_id;
DROP INDEX IF EXISTS idx_professional_schedules_day;

-- Índices de exceções dos profissionais
DROP INDEX IF EXISTS idx_professional_exceptions_user_id;
DROP INDEX IF EXISTS idx_professional_exceptions_professional_id;
DROP INDEX IF EXISTS idx_professional_exceptions_dates;

-- Índices de configurações do estabelecimento
DROP INDEX IF EXISTS idx_business_settings_user_id;
DROP INDEX IF EXISTS idx_business_settings_day;

-- Índices de exceções do estabelecimento
DROP INDEX IF EXISTS idx_business_exceptions_user_id;
DROP INDEX IF EXISTS idx_business_exceptions_date;

-- =====================================================
-- REMOVER TABELAS (EM ORDEM REVERSA DAS DEPENDÊNCIAS)
-- =====================================================

-- Tabelas dependentes primeiro
DROP TABLE IF EXISTS business_exceptions;
DROP TABLE IF EXISTS business_settings;
DROP TABLE IF EXISTS professional_exceptions;
DROP TABLE IF EXISTS professional_schedules;
DROP TABLE IF EXISTS financial_entries;
DROP TABLE IF EXISTS appointments;

-- Tabelas principais
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS professionals;
DROP TABLE IF EXISTS clients;
