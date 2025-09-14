-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DAS MIGRAÇÕES
-- =====================================================
-- Este script verifica se todas as tabelas e estruturas foram criadas corretamente

-- =====================================================
-- VERIFICAR EXISTÊNCIA DAS TABELAS
-- =====================================================

DO $$ 
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'clients',
        'professionals', 
        'products',
        'appointments',
        'financial_entries',
        'professional_schedules',
        'professional_exceptions',
        'business_settings',
        'business_exceptions'
    ];
    table_name TEXT;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE TABELAS ===';
    
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        SELECT COUNT(*) INTO table_count
        FROM information_schema.tables 
        WHERE table_name = table_name;
        
        IF table_count > 0 THEN
            RAISE NOTICE '✓ Tabela % existe', table_name;
        ELSE
            RAISE NOTICE '✗ Tabela % NÃO existe', table_name;
        END IF;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAR COLUNAS PRINCIPAIS
-- =====================================================

DO $$ 
DECLARE
    column_count INTEGER;
    table_columns RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE COLUNAS ===';
    
    -- Verificar colunas da tabela clients
    FOR table_columns IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'clients' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'clients.%: %', table_columns.column_name, table_columns.data_type;
    END LOOP;
    
    -- Verificar colunas da tabela professionals
    FOR table_columns IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'professionals' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'professionals.%: %', table_columns.column_name, table_columns.data_type;
    END LOOP;
    
    -- Verificar colunas da tabela appointments
    FOR table_columns IN 
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'appointments' 
        ORDER BY ordinal_position
    LOOP
        RAISE NOTICE 'appointments.%: %', table_columns.column_name, table_columns.data_type;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAR ÍNDICES
-- =====================================================

DO $$ 
DECLARE
    index_count INTEGER;
    index_info RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE ÍNDICES ===';
    
    FOR index_info IN 
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname
    LOOP
        RAISE NOTICE '✓ Índice % na tabela %', index_info.indexname, index_info.tablename;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAR CONSTRAINTS
-- =====================================================

DO $$ 
DECLARE
    constraint_info RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE CONSTRAINTS ===';
    
    FOR constraint_info IN 
        SELECT constraint_name, table_name, constraint_type
        FROM information_schema.table_constraints 
        WHERE constraint_schema = 'public'
        AND constraint_name LIKE 'fk_%'
        ORDER BY table_name, constraint_name
    LOOP
        RAISE NOTICE '✓ % % em %', constraint_info.constraint_type, constraint_info.constraint_name, constraint_info.table_name;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAR TRIGGERS
-- =====================================================

DO $$ 
DECLARE
    trigger_info RECORD;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE TRIGGERS ===';
    
    FOR trigger_info IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND trigger_name LIKE '%updated_at%'
        ORDER BY event_object_table, trigger_name
    LOOP
        RAISE NOTICE '✓ Trigger % na tabela %', trigger_info.trigger_name, trigger_info.event_object_table;
    END LOOP;
END $$;

-- =====================================================
-- VERIFICAR VIEWS
-- =====================================================

DO $$ 
DECLARE
    view_count INTEGER;
BEGIN
    RAISE NOTICE '=== VERIFICAÇÃO DE VIEWS ===';
    
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views 
    WHERE table_schema = 'public'
    AND table_name LIKE 'v_%';
    
    IF view_count > 0 THEN
        RAISE NOTICE '✓ % views encontradas', view_count;
    ELSE
        RAISE NOTICE '✗ Nenhuma view encontrada';
    END IF;
END $$;

-- =====================================================
-- TESTE DE INSERÇÃO BÁSICA
-- =====================================================

DO $$ 
DECLARE
    test_user_id TEXT := 'test_user_' || extract(epoch from now());
    client_id INTEGER;
    professional_id INTEGER;
    product_id INTEGER;
    appointment_id INTEGER;
    financial_id INTEGER;
BEGIN
    RAISE NOTICE '=== TESTE DE INSERÇÃO ===';
    
    BEGIN
        -- Inserir cliente de teste
        INSERT INTO clients (user_id, name, phone, email) 
        VALUES (test_user_id, 'Cliente Teste', '123456789', 'teste@email.com')
        RETURNING id INTO client_id;
        RAISE NOTICE '✓ Cliente inserido com ID: %', client_id;
        
        -- Inserir profissional de teste
        INSERT INTO professionals (user_id, name) 
        VALUES (test_user_id, 'Profissional Teste')
        RETURNING id INTO professional_id;
        RAISE NOTICE '✓ Profissional inserido com ID: %', professional_id;
        
        -- Inserir produto de teste
        INSERT INTO products (user_id, name, description, price, quantity) 
        VALUES (test_user_id, 'Produto Teste', 'Descrição teste', 5000, 10)
        RETURNING id INTO product_id;
        RAISE NOTICE '✓ Produto inserido com ID: %', product_id;
        
        -- Inserir agendamento de teste
        INSERT INTO appointments (user_id, client_id, client_name, service, price, professional, professional_id, appointment_date) 
        VALUES (test_user_id, client_id, 'Cliente Teste', 'Serviço Teste', 5000, 'Profissional Teste', professional_id, NOW() + INTERVAL '1 day')
        RETURNING id INTO appointment_id;
        RAISE NOTICE '✓ Agendamento inserido com ID: %', appointment_id;
        
        -- Inserir entrada financeira de teste
        INSERT INTO financial_entries (user_id, description, amount, type, entry_type, entry_date, appointment_id) 
        VALUES (test_user_id, 'Receita Teste', 5000, 'receita', 'pontual', CURRENT_DATE, appointment_id)
        RETURNING id INTO financial_id;
        RAISE NOTICE '✓ Entrada financeira inserida com ID: %', financial_id;
        
        -- Limpar dados de teste
        DELETE FROM financial_entries WHERE id = financial_id;
        DELETE FROM appointments WHERE id = appointment_id;
        DELETE FROM products WHERE id = product_id;
        DELETE FROM professionals WHERE id = professional_id;
        DELETE FROM clients WHERE id = client_id;
        
        RAISE NOTICE '✓ Dados de teste removidos com sucesso';
        RAISE NOTICE '=== VERIFICAÇÃO CONCLUÍDA COM SUCESSO ===';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '✗ Erro durante teste: %', SQLERRM;
        RAISE NOTICE '=== VERIFICAÇÃO FALHOU ===';
    END;
END $$;
