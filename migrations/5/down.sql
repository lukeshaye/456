-- =====================================================
-- ROLLBACK DA MIGRAÇÃO 5: REMOVER CONTROLE DE PRESENÇA (ATTENDED)
-- =====================================================
-- Este script reverte as alterações feitas na migração 5.

-- 1. Remover o índice da coluna `attended`
DROP INDEX IF EXISTS idx_appointments_attended;

-- 2. Readicionar a coluna `is_confirmed` (caso tenha sido removida)
-- O valor padrão será 'false'.
ALTER TABLE appointments
ADD COLUMN is_confirmed BOOLEAN DEFAULT false;

-- 3. Migrar os dados de volta da coluna `attended` para `is_confirmed`
UPDATE appointments
SET is_confirmed = true
WHERE attended = true;

-- 4. Remover a coluna `attended`
ALTER TABLE appointments
DROP COLUMN attended;

-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================
COMMENT ON COLUMN appointments.is_confirmed IS 'Controlava se o agendamento foi confirmado pelo cliente.';
