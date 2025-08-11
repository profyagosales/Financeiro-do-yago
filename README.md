# Financeiro do Yago

[![CI](https://img.shields.io/github/actions/workflow/status/YOUR_GITHUB_USERNAME/Financeiro-do-yago/ci.yml?branch=main&label=CI&logo=github)](https://github.com/YOUR_GITHUB_USERNAME/Financeiro-do-yago/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-18%2B-339933?logo=node.js&logoColor=white)

## Sobre o projeto

Aplicação web progressiva (PWA) para organização financeira pessoal. Desenvolvida com **React**, **TypeScript**, **Vite** e integração com **Supabase** para autenticação e persistência de dados.

### Capturas de tela

_Adicione suas imagens em `docs/screenshots`_

![Dashboard](docs/screenshots/dashboard.png)
![Instalação PWA](docs/screenshots/pwa-install.png)

## Requisitos

- Node.js 18+
- pnpm ou npm
- [Supabase CLI](https://supabase.com/docs/guides/cli)

## Setup local

1. Clone o repositório e entre na pasta do projeto.
2. Copie o arquivo de exemplo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Instale as dependências:
   ```bash
   pnpm install # ou npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   pnpm dev # ou npm run dev
   ```

## Scripts disponíveis

| Script      | Descrição                                         |
| ----------- | ------------------------------------------------- |
| `dev`       | Ambiente de desenvolvimento com Vite              |
| `build`     | Gera build de produção em `dist/`                 |
| `preview`   | Servidor local para inspecionar o build           |
| `lint`      | Executa o ESLint                                  |
| `typecheck` | Verificação de tipos com TypeScript               |
| `format`    | `npx prettier . --write` (não há script dedicado) |
| `test`      | _não definido_                                    |

## PWA

- `public/manifest.webmanifest` define nome, ícones e temas.
- `src/sw.ts` registra o _service worker_ usado para cache e funcionamento offline.
- Após o build, abra o app em um navegador compatível e utilize **"Adicionar à tela inicial"** para instalá-lo.

## Supabase

1. Instale e faça login no Supabase CLI.
2. Rode as migrações:
   ```bash
   supabase migration up
   ```
3. Popule os dados de exemplo:
   ```bash
   supabase db seed -f supabase/seed.sql
   ```
4. Variáveis de ambiente mínimas:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Estrutura de pastas

```
├── src/                 # componentes, páginas, hooks e estados
├── public/              # assets estáticos e manifest
├── supabase/            # migrações e seed do banco
├── scripts/             # utilitários e codemods
├── index.html           # ponto de entrada
├── package.json         # dependências e scripts
├── tailwind.config.js   # configuração do Tailwind
└── vite.config.ts       # configuração do Vite
```

## Convenções

- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/).
- **Branches:** `feat/<descricao>`, `fix/<descricao>`, `chore/<descricao>`.
- **Pull Requests:** descreva a motivação, principais mudanças e inclua screenshots quando aplicável.

## Roadmap

- [ ] Finanças (controle de receitas e despesas)
- [ ] Investimentos
- [ ] Metas
- [ ] Milhas
- [ ] Bills/OCR

## PWA Assets (SVG → PNG/ICO)

Este repositório usa apenas SVGs (texto) para ícones e imagem OG.
Para gerar os binários localmente:

1. Instale as dependências:
   npm i

2. Gere os PNG/ICO:
   npm run assets:pwa

Arquivos gerados:

- public/icons/icon-192.png
- public/icons/icon-512.png
- public/icons/maskable-512.png
- public/icons/favicon.ico

## Licença

Distribuído sob licença MIT. Veja `LICENSE` para mais informações.
