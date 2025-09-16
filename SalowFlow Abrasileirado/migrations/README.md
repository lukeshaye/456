# Migrações do Banco de Dados - SalonFlow

Este diretório contém os scripts de migração para o banco de dados do SalonFlow, incluindo as melhorias implementadas para gestão de profissionais e refatoração da arquitetura.

## 📁 Estrutura dos Arquivos

```
migrations/
├── 1.sql                    # Migração inicial (tabelas básicas)
├── 1/down.sql              # Rollback da migração 1
├── 2.sql                    # Migração 2 (atualizações)
├── 2/down.sql              # Rollback da migração 2
├── 3.sql                    # Migração 3 (integração completa das melhorias)
├── 3/down.sql              # Rollback da migração 3
├── 4.sql                    # Migração 4 (atualização de tabelas existentes)
├── 4/down.sql              # Rollback da migração 4
├── verify.sql              # Script de verificação
└── README.md               # Este arquivo
```

## 🚀 Como Executar as Migrações

### 1. Migração Completa (Recomendado para novos projetos)

```bash
# Executar todas as migrações em ordem
psql -d salonflow -f migrations/1.sql
psql -d salonflow -f migrations/2.sql
psql -d salonflow -f migrations/3.sql
psql -d salonflow -f migrations/4.sql
```

### 2. Migração Incremental (Para projetos existentes)

Se você já tem um banco de dados existente, execute apenas as migrações necessárias:

```bash
# Para adicionar gestão de profissionais
psql -d salonflow -f migrations/3.sql

# Para atualizar tabelas existentes
psql -d salonflow -f migrations/4.sql
```

### 3. Verificação

Após executar as migrações, execute o script de verificação:

```bash
psql -d salonflow -f migrations/verify.sql
```

## 📋 O que cada migração faz

### Migração 1 (1.sql)
- Cria tabelas básicas: `appointments`, `financial_entries`, `products`
- Configurações básicas do estabelecimento

### Migração 2 (2.sql)
- Adiciona tabela `clients`
- Adiciona coluna `quantity` na tabela `products`
- Índices básicos

### Migração 3 (3.sql) - **NOVA**
- Cria tabela `professionals` para gestão de profissionais
- Cria tabelas de horários e exceções dos profissionais
- Adiciona chaves estrangeiras e constraints
- Cria triggers para atualização automática de timestamps
- Cria views úteis para consultas complexas
- Índices otimizados para performance

### Migração 4 (4.sql) - **NOVA**
- Atualiza tabelas existentes para integrar com as melhorias
- Adiciona colunas de referência (`client_id`, `professional_id`)
- Adiciona constraints de validação
- Adiciona colunas de controle (`is_active`, `is_recurring`)

## 🔄 Rollback (Desfazer Migrações)

Para desfazer as migrações, execute os scripts `down.sql` na ordem reversa:

```bash
# Desfazer migração 4
psql -d salonflow -f migrations/4/down.sql

# Desfazer migração 3
psql -d salonflow -f migrations/3/down.sql

# E assim por diante...
```

## 🏗️ Estrutura das Tabelas Principais

### Tabela `clients`
```sql
- id (SERIAL PRIMARY KEY)
- user_id (TEXT NOT NULL)
- name (TEXT NOT NULL)
- phone (TEXT)
- email (TEXT)
- notes (TEXT)
- created_at, updated_at (TIMESTAMP)
```

### Tabela `professionals`
```sql
- id (SERIAL PRIMARY KEY)
- user_id (TEXT NOT NULL)
- name (TEXT NOT NULL)
- created_at, updated_at (TIMESTAMP)
```

### Tabela `appointments` (Atualizada)
```sql
- id (SERIAL PRIMARY KEY)
- user_id (TEXT NOT NULL)
- client_id (INTEGER) -- NOVA: Referência ao cliente
- client_name (TEXT) -- Mantida para compatibilidade
- service (TEXT NOT NULL)
- price (INTEGER NOT NULL)
- professional (TEXT) -- Mantida para compatibilidade
- professional_id (INTEGER) -- NOVA: Referência ao profissional
- appointment_date (TIMESTAMP NOT NULL)
- is_confirmed (BOOLEAN DEFAULT false)
- created_at, updated_at (TIMESTAMP)
```

### Tabela `products` (Atualizada)
```sql
- id (SERIAL PRIMARY KEY)
- user_id (TEXT NOT NULL)
- name (TEXT NOT NULL)
- description (TEXT)
- price (INTEGER NOT NULL)
- quantity (INTEGER DEFAULT 0) -- NOVA: Controle de estoque
- image_url (TEXT)
- created_at, updated_at (TIMESTAMP)
```

## 🔍 Views Úteis

### `v_appointments_complete`
View que combina informações de agendamentos, clientes e profissionais:

```sql
SELECT * FROM v_appointments_complete 
WHERE user_id = 'seu_user_id' 
AND appointment_date >= CURRENT_DATE;
```

### `v_financial_summary`
View para relatórios financeiros mensais:

```sql
SELECT * FROM v_financial_summary 
WHERE user_id = 'seu_user_id' 
ORDER BY month DESC;
```

## ⚡ Performance

As migrações incluem índices otimizados para:
- Buscas por `user_id` (todas as tabelas)
- Filtros por data (agendamentos e entradas financeiras)
- Joins entre tabelas relacionadas
- Consultas de relatórios

## 🛡️ Segurança

- Todas as tabelas têm chaves estrangeiras com `ON DELETE CASCADE` ou `ON DELETE SET NULL`
- Constraints de validação para dados críticos
- Triggers para atualização automática de timestamps
- Índices únicos para evitar duplicatas

## 🐛 Troubleshooting

### Erro: "relation already exists"
Se você receber este erro, significa que a tabela já existe. Execute apenas as migrações necessárias.

### Erro: "column already exists"
Se você receber este erro, significa que a coluna já foi adicionada. A migração 4 usa `IF NOT EXISTS` para evitar este problema.

### Verificar Status das Migrações
Execute o script `verify.sql` para verificar se todas as estruturas foram criadas corretamente.

## 📞 Suporte

Se encontrar problemas com as migrações:

1. Execute o script `verify.sql` para diagnosticar
2. Verifique os logs do PostgreSQL
3. Consulte a documentação do Supabase
4. Abra uma issue no repositório do projeto

---

**Nota**: Sempre faça backup do seu banco de dados antes de executar migrações em produção! 🚨
