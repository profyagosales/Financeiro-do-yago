set -e

TS=$(date +%Y-%m-%d_%H-%M-%S)
OUT_DIR="../fy-backup-$TS"
CODE_DIR="$OUT_DIR/code"
DB_DIR="$OUT_DIR/db"
ENV_DIR="$OUT_DIR/env"

mkdir -p "$CODE_DIR" "$DB_DIR" "$ENV_DIR"

# 2) Copiar código (sem node_modules / build / git)
rsync -a \
  --exclude ".git" \
  --exclude "node_modules" \
  --exclude "dist" \
  --exclude ".vite" \
  --exclude ".DS_Store" \
  --exclude ".vscode" \
  ./ "$CODE_DIR/"

# 3) Ambiente (.env.local privado)
[ -f ".env.local" ] && cp .env.local "$ENV_DIR/.env.local" || true

# Cria .env.example (sem chaves) se não existir
if [ ! -f "$CODE_DIR/.env.example" ]; then
  cat > "$CODE_DIR/.env.example" << 'E2'
VITE_SUPABASE_URL=coloque_sua_url_aqui
VITE_SUPABASE_ANON_KEY=coloque_sua_anon_key_aqui
# Outras variáveis...
E2
fi

# 4) Banco (schema + dados) — requer CLI linkado; se falhar, apenas avisa
npx -y supabase db pull || echo "[AVISO] Não consegui puxar o schema. Rode 'npx supabase link' e tente de novo."
[ -d "supabase/migrations" ] && rsync -a supabase/migrations "$DB_DIR/" || true
[ -f "supabase/schema.sql" ] && cp supabase/schema.sql "$DB_DIR/schema.sql" || true
npx -y supabase db dump --data-only -f "$DB_DIR/seed.sql" || echo "[AVISO] Dump de dados falhou. Você pode criar manualmente depois."

# 5) README (gera se não existir)
if [ ! -f "$CODE_DIR/README.md" ]; then
  cat > "$CODE_DIR/README.md" << 'E3'
# Financeiro do Yago

## Requisitos
- Node 18+
- NPM
- Supabase (URL + anon key em `.env.local`)
- Tailwind + shadcn

## Setup
npm install
cp .env.example .env.local  # preencha com suas chaves
npm run dev

## Supabase (dev)
npx supabase link
npx supabase db pull

## Build
npm run build
npm run preview
E3
fi

# 6) Gerar ZIP final
cd "$(dirname "$OUT_DIR")"
ZIP="fy-backup-$TS.zip"
zip -rq "$ZIP" "$(basename "$OUT_DIR")"

echo "✅ Backup criado em: $(pwd)/$ZIP"
echo "   Conteúdo:"
echo "   - code/ (código + README + .env.example)"
echo "   - env/.env.local (privado, se existia)"
echo "   - db/schema.sql + migrations/ + seed.sql (se disponíveis)"
