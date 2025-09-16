-- =====================================================
-- MIGRAÇÃO 4: ATUALIZAÇÃO DE TABELAS EXISTENTES
-- =====================================================
-- Este script atualiza tabelas existentes para integrar com as melhorias

-- =====================================================
-- ATUALIZAÇÕES NA TABELA DE AGENDAMENTOS
-- =====================================================

-- Adicionar coluna client_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'client_id') THEN
        ALTER TABLE appointments ADD COLUMN client_id INTEGER;
    END IF;
END $$;

-- Adicionar coluna professional_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'appointments' AND column_name = 'professional_id') THEN
        ALTER TABLE appointments ADD COLUMN professional_id INTEGER;
    END IF;
END $$;

-- =====================================================
-- ATUALIZAÇÕES NA TABELA DE PRODUTOS
-- =====================================================

-- Adicionar coluna quantity se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'quantity') THEN
        ALTER TABLE products ADD COLUMN quantity INTEGER DEFAULT 0;
    END IF;
END $$;

-- =====================================================
-- ATUALIZAÇÕES NA TABELA DE ENTRADAS FINANCEIRAS
-- =====================================================

-- Adicionar coluna appointment_id se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'financial_entries' AND column_name = 'appointment_id') THEN
        ALTER TABLE financial_entries ADD COLUMN appointment_id INTEGER;
    END IF;
END $$;

-- =====================================================
-- ADICIONAR CONSTRAINTS DE VALIDAÇÃO
-- =====================================================

-- Adicionar constraints de validação para financial_entries
DO $$ 
BEGIN
    -- Verificar se a constraint de type já existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'financial_entries_type_check') THEN
        ALTER TABLE financial_entries ADD CONSTRAINT financial_entries_type_check 
        CHECK (type IN ('receita', 'despesa'));
    END IF;
    
    -- Verificar se a constraint de entry_type já existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'financial_entries_entry_type_check') THEN
        ALTER TABLE financial_entries ADD CONSTRAINT financial_entries_entry_type_check 
        CHECK (entry_type IN ('pontual', 'fixa'));
    END IF;
END $$;

-- Adicionar constraints de validação para professional_schedules
DO $$ 
BEGIN
    -- Verificar se a constraint de day_of_week já existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'professional_schedules_day_check') THEN
        ALTER TABLE professional_schedules ADD CONSTRAINT professional_schedules_day_check 
        CHECK (day_of_week >= 0 AND day_of_week <= 6);
    END IF;
END $$;

-- Adicionar constraints de validação para business_settings
DO $$ 
BEGIN
    -- Verificar se a constraint de day_of_week já existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'business_settings_day_check') THEN
        ALTER TABLE business_settings ADD CONSTRAINT business_settings_day_check 
        CHECK (day_of_week >= 0 AND day_of_week <= 6);
    END IF;
END $$;

-- =====================================================
-- ADICIONAR CHAVES ESTRANGEIRAS
-- =====================================================

-- Adicionar foreign key para appointments -> clients
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_appointments_client') THEN
        ALTER TABLE appointments ADD CONSTRAINT fk_appointments_client 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar foreign key para appointments -> professionals
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_appointments_professional') THEN
        ALTER TABLE appointments ADD CONSTRAINT fk_appointments_professional 
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Adicionar foreign key para financial_entries -> appointments
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_financial_entries_appointment') THEN
        ALTER TABLE financial_entries ADD CONSTRAINT fk_financial_entries_appointment 
        FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Adicionar foreign key para professional_schedules -> professionals
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_professional_schedules_professional') THEN
        ALTER TABLE professional_schedules ADD CONSTRAINT fk_professional_schedules_professional 
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Adicionar foreign key para professional_exceptions -> professionals
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_professional_exceptions_professional') THEN
        ALTER TABLE professional_exceptions ADD CONSTRAINT fk_professional_exceptions_professional 
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE;
    END IF;
END $$;

-- =====================================================
-- ADICIONAR COLUNAS DE CONTROLE
-- =====================================================

-- Adicionar coluna is_active para professional_schedules
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'professional_schedules' AND column_name = 'is_active') THEN
        ALTER TABLE professional_schedules ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Adicionar coluna is_active para business_settings
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'business_settings' AND column_name = 'is_active') THEN
        ALTER TABLE business_settings ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Adicionar coluna is_recurring para professional_exceptions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'professional_exceptions' AND column_name = 'is_recurring') THEN
        ALTER TABLE professional_exceptions ADD COLUMN is_recurring BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Adicionar coluna is_recurring para business_exceptions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'business_exceptions' AND column_name = 'is_recurring') THEN
        ALTER TABLE business_exceptions ADD COLUMN is_recurring BOOLEAN DEFAULT false;
    END IF;
END $$;

-- =====================================================
-- ADICIONAR ÍNDICES ADICIONAIS
-- =====================================================

-- Índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_appointment_id ON financial_entries(appointment_id);
CREATE INDEX IF NOT EXISTS idx_professional_schedules_is_active ON professional_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_business_settings_is_active ON business_settings(is_active);

-- =====================================================
-- ATUALIZAR DADOS EXISTENTES (OPCIONAL)
-- =====================================================

-- Migrar dados de client_name para client_id (se necessário)
-- Este bloco pode ser executado se você quiser migrar dados existentes
/*
DO $$ 
DECLARE
    appointment_record RECORD;
    client_record RECORD;
BEGIN
    -- Para cada agendamento que não tem client_id mas tem client_name
    FOR appointment_record IN 
        SELECT id, client_name, user_id 
        FROM appointments 
        WHERE client_id IS NULL AND client_name IS NOT NULL
    LOOP
        -- Tentar encontrar o cliente correspondente
        SELECT id INTO client_record 
        FROM clients 
        WHERE name = appointment_record.client_name 
        AND user_id = appointment_record.user_id 
        LIMIT 1;
        
        -- Se encontrou o cliente, atualizar o appointment
        IF FOUND THEN
            UPDATE appointments 
            SET client_id = client_record.id 
            WHERE id = appointment_record.id;
        END IF;
    END LOOP;
END $$;
*/

-- =====================================================
-- COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================

COMMENT ON COLUMN appointments.client_id IS 'Referência ao cliente na tabela clients';
COMMENT ON COLUMN appointments.professional_id IS 'Referência ao profissional na tabela professionals';
COMMENT ON COLUMN financial_entries.appointment_id IS 'Referência ao agendamento que gerou esta entrada financeira';
COMMENT ON COLUMN products.quantity IS 'Quantidade em estoque do produto';
COMMENT ON COLUMN professional_schedules.is_active IS 'Indica se o horário está ativo';
COMMENT ON COLUMN business_settings.is_active IS 'Indica se a configuração está ativa';
COMMENT ON COLUMN professional_exceptions.is_recurring IS 'Indica se a exceção é recorrente';
COMMENT ON COLUMN business_exceptions.is_recurring IS 'Indica se a exceção é recorrente';
