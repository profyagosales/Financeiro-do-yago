# Financeiro do Yago

[![CI](https://img.shields.io/github/actions/workflow/status/YOUR_GITHUB_USERNAME/Financeiro-do-yago/ci.yml?branch=main&label=CI&logo=github)](https://github.com/YOUR_GITHUB_USERNAME/Financeiro-do-yago/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
![Node](https://img.shields.io/badge/node-18%2B-339933?logo=node.js&logoColor=white)

## Sobre o projeto

Aplicação web progressiva (PWA) para organização financeira pessoal. Desenvolvida com **React**, **TypeScript**, **Vite** e integração com **Supabase** para autenticação e persistência de dados. A interface usa navegação por barra superior (TopNav), sem barra lateral.

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

## Design Tokens & Contraste

Este projeto padroniza cores e estados via *CSS Custom Properties* e utilitários Tailwind para garantir acessibilidade e consistência entre claro/escuro.

### Principais tokens

| Token | Uso |
| ----- | ---- |
| `--foreground` | Texto primário (alto contraste) |
| `--muted-foreground` | Texto secundário / meta (`.text-fg-muted`) |
| `--disabled-bg` | Plano de fundo de controles desabilitados |
| `--disabled-fg` | Texto/ícone de controles desabilitados |
| `--primary` / `--primary-foreground` | Ações principais |
| `--accent` / `--accent-foreground` | Realces neutros / hovers |

Os tokens são definidos em `src/index.css` em `@layer base` para compatibilidade com o ecossistema shadcn + Tailwind.

### Utilitários customizados

- `.text-fg-muted` → aplica `color: var(--color-fg-muted)`
- `.placeholder-fg-muted` → harmoniza cor de placeholder com texto secundário

Estados desabilitados usam diretamente tokens: `disabled:bg-[hsl(var(--disabled-bg))] disabled:text-[hsl(var(--disabled-fg))]` evitando hardcode de escalas `neutral-*` e garantindo contraste adequado tanto no tema claro quanto escuro.

### Boas práticas

**FAÇA**
- Reutilize tokens: `text-[hsl(var(--disabled-fg))]` em vez de `text-neutral-500`.
- Prefira utilitários sem opacidade artificial (evita problemas de contraste no dark).
- Use `.text-fg-muted` para labels secundários, descrições, métricas contextuais.

**NÃO FAÇA**
- Definir `text-neutral-400/50` para “muted” (perde legibilidade em dark).
- Misturar escalas (`slate`, `zinc`, `neutral`) para disabled; use os tokens.
- Aplicar opacidade em containers para “desabilitar” (afeta filhos involuntariamente).

### Migrando componentes

1. Remova classes `text-muted-foreground` → substitua por `.text-fg-muted`.
2. Converta `disabled:bg-neutral-200 disabled:text-neutral-500 ...` → tokens `--disabled-*`.
3. Ajuste placeholders para `.placeholder-fg-muted`.

### Acessibilidade

Os valores de `--muted-foreground` foram ajustados para manter contraste mínimo ~4.5:1 sobre o background nos dois temas. Evite reduzir opacidade adicional (ex: `opacity-60`) em texto informativo; use sempre a cor correta.

### Futuro

Planeja-se adicionar testes visuais (Chromatic ou Playwright) para validar contrastes ao alterar tokens.
