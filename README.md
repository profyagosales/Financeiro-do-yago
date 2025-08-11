# Financeiro do Yago

## Visão Geral
Aplicação web para controle financeiro pessoal, construída com **React**, **TypeScript** e **Vite**. O projeto utiliza **Tailwind CSS** para estilização e integrações com o **Supabase** para persistência de dados.

## Instalação
1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado (versão LTS recomendada).
2. Clone o repositório e instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente criando um arquivo `.env` com as chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=... 
   VITE_SUPABASE_ANON_KEY=...
   ```

## Scripts
- `npm run dev` – inicia o servidor de desenvolvimento com recarregamento automático.
- `npm run build` – gera a versão otimizada do aplicativo em `dist/`.
- `npm run preview` – serve localmente o build produzido.
- `npm run lint` – executa a verificação de lint em todos os arquivos do projeto.

## Estrutura de Pastas
```
├── src/             # código fonte da aplicação (componentes, páginas, hooks)
├── public/          # arquivos estáticos públicos
├── supabase/        # scripts SQL e migrações do banco de dados
├── index.html       # ponto de entrada HTML
├── vite.config.ts   # configuração do Vite
├── tailwind.config.js # configuração do Tailwind CSS
└── package.json     # dependências e scripts
```

## Fluxo de Deploy
1. Execute o build de produção:
   ```bash
   npm run build
   ```
2. O conteúdo gerado em `dist/` pode ser hospedado em qualquer serviço de arquivos estáticos (Vercel, Netlify, etc.).
3. Configure no servidor as variáveis de ambiente necessárias do Supabase.
