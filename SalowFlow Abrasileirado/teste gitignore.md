Dependências e pacotes instalados
A pasta node_modules é a mais importante a ser ignorada, pois pode conter
milhares de ficheiros que podem ser reinstalados a qualquer momento com 'npm install'.
/node_modules

Ficheiros de Build e Produção
A pasta 'dist' é gerada automaticamente pelo comando 'npm run build' e contém
o código otimizado para produção. Não deve ser versionada.
/dist
/build

Cache do Vite
Ficheiros de cache gerados pelo Vite para acelerar o processo de desenvolvimento.
.vite

Ficheiros de ambiente
MUITO IMPORTANTE: Nunca envie as suas chaves secretas (API keys, etc.) para o GitHub!
Estes ficheiros contêm informação sensível.
.env
.env.local
.env.*.local

Ficheiros de log de erros e depuração
Logs gerados pelo npm, yarn ou outras ferramentas durante a execução.
npm-debug.log*
yarn-error.log*
pnpm-debug.log*
*.log
_logs
.log.

Diretórios de IDEs e editores de código
Ficheiros de configuração específicos do ambiente de desenvolvimento de cada programador.
.idea/
.vscode/
*.suo
.ntvs
*.njsproj
*.sln
*.sw?

Ficheiros gerados pelo sistema operativo
Ficheiros de sistema operativo que não são relevantes para o projeto (ex: macOS, Windows).
.DS_Store
Thumbs.db

Ficheiros de desenvolvimento local do Cloudflare Wrangler
Pasta de configuração local para o deploy no Cloudflare.
.wrangler/

Ficheiros temporários de TypeScript
Cache de compilação do TypeScript para melhorar a performance.
*.tsbuildinfo

Relatórios de cobertura de testes
Pasta gerada automaticamente ao executar os testes com a opção de cobertura.
/coverage