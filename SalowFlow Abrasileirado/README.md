# SalonFlow

Sistema de gestão completo para salões de beleza e barbearias, desenvolvido com React, TypeScript e Supabase.

## 🚀 Funcionalidades

- **Dashboard**: Visão geral do negócio com métricas importantes
- **Agendamentos**: Gestão completa de marcações e horários
- **Clientes**: Base de dados de clientes com histórico
- **Profissionais**: Gestão da equipa e especialidades
- **Produtos**: Catálogo de serviços e produtos
- **Financeiro**: Controle de receitas e despesas
- **Configurações**: Personalização do sistema

## 🛠️ Tecnologias

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Roteamento**: React Router DOM
- **Estado**: Zustand
- **Formulários**: React Hook Form + Zod
- **Build**: Vite
- **Deploy**: Cloudflare Workers

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Conta no Supabase
- Conta no Cloudflare (para deploy)

## ⚙️ Configuração do Ambiente

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd SalonFlow
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrações SQL na ordem:
   ```bash
   # Execute os arquivos na pasta migrations/ na ordem:
   # 1.sql, 2.sql, 3.sql, 4.sql
   ```

3. Configure as variáveis de ambiente:
   ```bash
   # Crie um arquivo .env.local na raiz do projeto
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   ```

### 4. Execute o projeto em desenvolvimento
```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas principais:

- `clients` - Dados dos clientes
- `professionals` - Profissionais do salão
- `products` - Serviços e produtos oferecidos
- `appointments` - Agendamentos
- `financial_entries` - Entradas financeiras

## 🚀 Deploy

### Deploy no Cloudflare Workers

1. Instale o Wrangler CLI:
```bash
npm install -g wrangler
```

2. Configure o Wrangler:
```bash
wrangler login
```

3. Faça o build do projeto:
```bash
npm run build
```

4. Deploy:
```bash
wrangler deploy
```

### Deploy Manual

1. Execute o build:
```bash
npm run build
```

2. Os arquivos estáticos estarão na pasta `dist/`
3. Faça upload para seu servidor web preferido

## 🧪 Testes

Para executar os testes (quando implementados):
```bash
npm run test
```

## 📁 Estrutura do Projeto

```
src/
├── react-app/           # Aplicação React principal
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/          # Páginas da aplicação
│   ├── contexts/       # Contextos React
│   ├── auth/           # Autenticação
│   └── utils.ts        # Utilitários
├── shared/             # Código compartilhado
│   ├── store.ts        # Estado global (Zustand)
│   └── types.ts        # Definições de tipos
└── worker/             # Cloudflare Worker
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run lint` - Executa o linter
- `npm run check` - Verifica tipos e build

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

- Discord: [Comunidade Mocha](https://discord.gg/shDEGBSe2d)
- Issues: Use a aba Issues do GitHub
- Documentação: [Mocha Docs](https://getmocha.com)

## 🎯 Roadmap

- [ ] Testes automatizados
- [ ] PWA (Progressive Web App)
- [ ] App mobile
- [ ] Integração com pagamentos
- [ ] Relatórios avançados
- [ ] Sistema de backup automático
