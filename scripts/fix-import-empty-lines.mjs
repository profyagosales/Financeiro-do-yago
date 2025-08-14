import fs from 'node:fs';
import path from 'node:path';

const isImport = (l) => /^\s*import\b/.test(l);
const isEmpty = (l) => /^\s*$/.test(l);

// Classifica o import em grupo
function groupOf(line) {
  // side-effect (sem from, ex.: import './x.css')
  if (/^\s*import\s+['"][^'"]+['"]\s*;?\s*$/.test(line)) return 'side';
  const m = line.match(/from\s+['"]([^'"]+)['"]/);
  const src = m ? m[1] : null;
  if (!src) return 'pkg'; // fallback prudente

  if (src.startsWith('node:')) return 'node';
  if (src.startsWith('@/')) return 'alias';
  if (src.startsWith('./') || src.startsWith('../')) return 'rel';
  return 'pkg';
}

// Reescreve o bloco de imports garantindo:
// - sem linhas vazias internas
// - 1 linha em branco entre grupos existentes
function renderGroups(groups) {
  const order = ['node', 'pkg', 'alias', 'rel', 'side'];
  const chunks = [];
  for (const g of order) {
    const arr = groups[g];
    if (arr && arr.length) {
      // remove vazias internas
      const cleaned = arr.filter((l) => !isEmpty(l));
      if (cleaned.length) chunks.push(cleaned.join('\n'));
    }
  }
  return chunks.join('\n\n') + '\n';
}

function fixFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const lines = src.split('\n');

  // Detecta o bloco inicial (imports + vazias)
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!isImport(line) && !isEmpty(line)) break;
    i++;
  }
  const importBlock = lines.slice(0, i);
  const rest = lines.slice(i);

  if (!importBlock.some(isImport)) {
    console.log(`= Sem bloco de import: ${filePath}`);
    return;
  }

  // Separa por grupos mantendo ordem relativa dentro de cada grupo.
  const groups = { node: [], pkg: [], alias: [], rel: [], side: [] };
  for (const l of importBlock) {
    if (isImport(l)) groups[groupOf(l)].push(l);
    // ignora vazias: serão reconstruídas
  }

  const rebuilt = renderGroups(groups);
  const out = rebuilt + rest.join('\n');

  if (out !== src) {
    fs.writeFileSync(filePath, out, 'utf8');
    console.log(`✔ Corrigido: ${filePath}`);
  } else {
    console.log(`= Sem mudanças: ${filePath}`);
  }
}

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('Uso: node scripts/fix-import-empty-lines.mjs <arquivos...>');
  process.exit(1);
}

for (const t of targets) {
  const p = path.resolve(t);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) {
    fixFile(p);
  } else {
    console.warn(`(ignorado) não é arquivo: ${t}`);
  }
}