
-- Remover índices
DROP INDEX idx_business_exceptions_user_id;
DROP INDEX idx_business_settings_user_id;
DROP INDEX idx_professional_exceptions_professional_id;
DROP INDEX idx_professional_exceptions_user_id;
DROP INDEX idx_professional_schedules_professional_id;
DROP INDEX idx_professional_schedules_user_id;
DROP INDEX idx_professionals_user_id;
DROP INDEX idx_products_user_id;
DROP INDEX idx_financial_entries_date;
DROP INDEX idx_financial_entries_user_id;
DROP INDEX idx_appointments_date;
DROP INDEX idx_appointments_user_id;

-- Remover tabelas
DROP TABLE business_exceptions;
DROP TABLE business_settings;
DROP TABLE professional_exceptions;
DROP TABLE professional_schedules;
DROP TABLE professionals;
DROP TABLE products;
DROP TABLE financial_entries;
DROP TABLE appointments;
