-- =====================================================
-- ROLLBACK DA MIGRAÇÃO 6: REMOVER DURAÇÃO FLEXÍVEL
-- =====================================================
-- Este script reverte as alterações feitas na migração 6,
-- removendo a coluna `end_date` e restaurando a estrutura anterior.

-- ETAPA 1: Recriar a VIEW `v_appointments_complete` para a sua versão anterior,
-- sem a coluna `end_date`. Isto deve ser feito antes de remover a coluna
-- para evitar erros de dependência.
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
  a.attended,
  a.created_at,
  a.updated_at
FROM appointments a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN professionals p ON a.professional_id = p.id;


-- ETAPA 2: Remover a constraint de verificação de datas.
-- Não é mais necessária, pois a coluna `end_date` será removida.
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS chk_appointment_dates;


-- ETAPA 3: Remover a coluna `end_date` da tabela `appointments`.
-- Esta é a ação principal do rollback.
ALTER TABLE appointments DROP COLUMN IF EXISTS end_date;


-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================
-- Restaura o comentário original da coluna `appointment_date`, caso tenha sido alterado.
COMMENT ON COLUMN appointments.appointment_date IS 'Armazena a data e hora do agendamento.';
