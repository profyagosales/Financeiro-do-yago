# ADR 0001: Visão geral da arquitetura

## Contexto
O projeto segue uma organização em camadas para manter a coesão e facilitar a evolução.

## Decisão
Adotar separação entre:
- **Apresentação**: componentes de interface construídos em React.
- **Negócio**: serviços e regras que tratam as transações de finanças, investimentos, metas e milhas.
- **Persistência**: acesso aos dados realizado via Supabase.

## Consequências
Essa abordagem permite isolamento entre responsabilidades e torna mais fácil testar e evoluir cada parte do sistema de forma independente.
