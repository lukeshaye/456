-- =====================================================
-- MIGRAÇÃO 5: ADICIONAR CONTROLE DE PRESENÇA (ATTENDED) - VERSÃO CORRIGIDA
-- =====================================================
-- Este script adiciona a nova coluna `attended` e remove a antiga `is_confirmed`.

-- ETAPA 1: Remover a VIEW que depende da coluna antiga
-- É necessário remover a dependência antes de apagar a coluna.
DROP VIEW IF EXISTS v_appointments_complete;


-- ETAPA 2: Adicionar a nova coluna `attended` com um valor padrão de `false`
-- Usamos `IF NOT EXISTS` para segurança, caso o passo tenha sido executado parcialmente.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'attended') THEN
        ALTER TABLE appointments ADD COLUMN attended BOOLEAN DEFAULT false;
    END IF;
END $$;


-- ETAPA 3: Migrar os dados da coluna antiga para a nova
-- Todos os agendamentos que estavam 'confirmados' agora serão considerados como 'comparecidos'.
UPDATE appointments
SET attended = true
WHERE is_confirmed = true;


-- ETAPA 4: Remover a coluna antiga `is_confirmed`
-- Agora que a dependência foi removida, este comando funcionará.
ALTER TABLE appointments
DROP COLUMN is_confirmed;


-- ETAPA 5: Adicionar um índice na nova coluna para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_appointments_attended ON appointments(attended);


-- ETAPA 6: Recriar a VIEW `v_appointments_complete` com a nova coluna `attended`
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
  a.attended, -- Usando a nova coluna aqui
  a.created_at,
  a.updated_at
FROM appointments a
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN professionals p ON a.professional_id = p.id;


-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================
COMMENT ON COLUMN appointments.attended IS 'Controla se o cliente compareceu ao agendamento (true) ou não (false).';