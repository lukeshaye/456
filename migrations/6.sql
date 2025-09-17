-- =====================================================
-- MIGRAÇÃO 6: ADICIONAR DURAÇÃO FLEXÍVEL AOS AGENDAMENTOS
-- Este script adiciona a coluna `end_date` à tabela `appointments`
-- para permitir que os agendamentos tenham uma hora de início e fim.
-- =====================================================

-- ETAPA 1: Remover a VIEW dependente antes de alterar a tabela
-- Isto é necessário para evitar o erro "cannot change name of view column".
DROP VIEW IF EXISTS v_appointments_complete;


-- ETAPA 2: Adicionar a nova coluna `end_date` para armazenar o fim do agendamento.
-- A coluna é adicionada como NULLABLE inicialmente para permitir a atualização
-- dos registos existentes na etapa seguinte.
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;


-- ETAPA 3: Preencher a nova coluna `end_date` para todos os agendamentos existentes.
-- É assumida uma duração padrão de 1 hora para todos os agendamentos anteriores a esta migração.
UPDATE appointments
SET end_date = appointment_date + INTERVAL '1 hour'
WHERE end_date IS NULL;


-- ETAPA 4: Tornar a coluna `end_date` obrigatória (NOT NULL).
-- Isto garante que todos os novos agendamentos terão uma data de fim.
ALTER TABLE appointments ALTER COLUMN end_date SET NOT NULL;


-- ETAPA 5: Recriar a VIEW com a nova estrutura da tabela
-- Agora, a view incluirá a nova coluna `end_date`.
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
  a.end_date, -- Coluna nova adicionada aqui
  a.attended,
  a.created_at,
  a.updated_at
FROM appointments a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN professionals p ON a.professional_id = p.id;


-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================
COMMENT ON COLUMN appointments.end_date IS 'Armazena a data e hora de término do agendamento.';