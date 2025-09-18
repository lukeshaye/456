-- =====================================================
-- MIGRAÇÃO 10: CONECTAR SERVIÇOS A AGENDAMENTOS
-- =====================================================
-- Este script adiciona a coluna `service_id` à tabela `appointments`
-- e cria a chave estrangeira para a tabela `services`.

-- ETAPA 1: Adicionar a coluna service_id à tabela appointments
-- Usamos IF NOT EXISTS para segurança, caso o passo já tenha sido executado.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'service_id') THEN
        ALTER TABLE appointments ADD COLUMN service_id INTEGER;
    END IF;
END $$;


-- ETAPA 2: Adicionar a chave estrangeira para garantir a integridade dos dados
-- Um agendamento agora deve estar ligado a um serviço válido.
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_appointments_service') THEN
        ALTER TABLE appointments ADD CONSTRAINT fk_appointments_service 
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL;
    END IF;
END $$;


-- ETAPA 3: Adicionar um índice na nova coluna para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);


-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================
COMMENT ON COLUMN appointments.service_id IS 'Referência ao serviço na tabela services.';
