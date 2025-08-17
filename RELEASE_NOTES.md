# Release Notes

## v0.1.0 - 2025-08-17

Principais destaques:

- Nova arquitetura das páginas de Finanças (Mensal, Anual, Resumo)
- Remoção completa do dark mode legacy e padronização de tokens Tailwind
- Novos hooks (`useMonthlyFilters`) e reorganização de rotas de finanças
- Dashboard modernizado com widgets stub e groundwork para dados reais

Commits incluídos:

- refactor(financas): padroniza tokens, remove dark mode, corrige lint e snapshots
- feat(api-mock): MSW + hooks consumindo /api + skeletons acessíveis nos widgets
- chore(home): remover página legacy HomeOverview
- refactor(home): definir dashboard como Home e ocultar hero antigo + mini-cards
- feat(dashboard): integrar react-query + ajustar layout (padding/top, scroll margin, provider)
- feat(dashboard): resumo geral com 6 widgets stub + tema surface único
- chore: fix hook rule (SectionContrastBadge) and import order for commit
- fix: implementa navegação hierárquica com dropdowns (#252)
- Fix/assets 1755224380 (#250)
- fix(nav): use import type for NavLinkProps and register service worker only in production
- chore: add repo verification script (#249)
- chore: exclude story files from app tsconfig (#248)
- chore: use project build for type checking (#247)
- refactor: update dashboard routes (#246)
- refactor: export PageHeader types separately (#245)
- refactor: centralize toast handling (#244)
- feat: update dashboard route (#243)
- chore: remove unused imports (#242)
- feat: modernize overview widgets (#241)
- feat: add menu suggestions component (#240)
