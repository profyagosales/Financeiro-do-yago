# Financeiro do Yago

Aplicação financeira construída com React, Vite e Supabase.

## Setup
1. Instale as dependências:
   ```bash
   npm ci
   ```
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   
   No Vercel, adicione essas variáveis no painel do projeto.
3. Inicie o ambiente de desenvolvimento:
   ```bash
   npm run dev
   ```

## Backups e Restauração
### Backups
- O workflow `nightly-backup` exporta `schema.sql` e `seed.sql` diariamente usando `pg_dump` e armazena os arquivos como artifact do GitHub.
- Localmente você pode usar `./backup-all.sh` para gerar um pacote completo com código, variáveis de ambiente e banco.

### Restauração
1. Restaure o schema:
   ```bash
   psql "$DATABASE_URL" < schema.sql
   ```
2. Restaure os dados:
   ```bash
   psql "$DATABASE_URL" < seed.sql
   ```
