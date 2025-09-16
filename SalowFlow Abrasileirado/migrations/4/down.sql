-- =====================================================
-- ROLLBACK DA MIGRAÇÃO 4: ATUALIZAÇÃO DE TABELAS EXISTENTES
-- =====================================================
-- Este script reverte as alterações feitas na migração 4

-- =====================================================
-- REMOVER ÍNDICES ADICIONAIS
-- =====================================================

DROP INDEX IF EXISTS idx_appointments_client_id;
DROP INDEX IF EXISTS idx_appointments_professional_id;
DROP INDEX IF EXISTS idx_financial_entries_appointment_id;
DROP INDEX IF EXISTS idx_professional_schedules_is_active;
DROP INDEX IF EXISTS idx_business_settings_is_active;

-- =====================================================
-- REMOVER CHAVES ESTRANGEIRAS
-- =====================================================

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS fk_appointments_client;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS fk_appointments_professional;
ALTER TABLE financial_entries DROP CONSTRAINT IF EXISTS fk_financial_entries_appointment;
ALTER TABLE professional_schedules DROP CONSTRAINT IF EXISTS fk_professional_schedules_professional;
ALTER TABLE professional_exceptions DROP CONSTRAINT IF EXISTS fk_professional_exceptions_professional;

-- =====================================================
-- REMOVER CONSTRAINTS DE VALIDAÇÃO
-- =====================================================

ALTER TABLE financial_entries DROP CONSTRAINT IF EXISTS financial_entries_type_check;
ALTER TABLE financial_entries DROP CONSTRAINT IF EXISTS financial_entries_entry_type_check;
ALTER TABLE professional_schedules DROP CONSTRAINT IF EXISTS professional_schedules_day_check;
ALTER TABLE business_settings DROP CONSTRAINT IF EXISTS business_settings_day_check;

-- =====================================================
-- REMOVER COLUNAS ADICIONADAS
-- =====================================================

-- Remover colunas de controle
ALTER TABLE professional_schedules DROP COLUMN IF EXISTS is_active;
ALTER TABLE business_settings DROP COLUMN IF EXISTS is_active;
ALTER TABLE professional_exceptions DROP COLUMN IF EXISTS is_recurring;
ALTER TABLE business_exceptions DROP COLUMN IF EXISTS is_recurring;

-- Remover colunas de referência
ALTER TABLE appointments DROP COLUMN IF EXISTS client_id;
ALTER TABLE appointments DROP COLUMN IF EXISTS professional_id;
ALTER TABLE financial_entries DROP COLUMN IF EXISTS appointment_id;

-- Remover coluna quantity dos produtos (se foi adicionada nesta migração)
-- ALTER TABLE products DROP COLUMN IF EXISTS quantity;
