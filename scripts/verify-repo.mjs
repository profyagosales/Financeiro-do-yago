#!/usr/bin/env node
/**
 * Repo Verifier — varre o código e reporta:
 * - <Select.Item value=""> (Radix Select com valor vazio)
 * - "export default" fora do top-level (suspeito em Milhas/*)
 * - Toaster importado direto de 'sonner' fora de ui/Toasts.ts
 * - PeriodContext shim correto (re-export para state/periodFilter)
 * - Rotas obrigatórias presentes em App.tsx (/dashboard, /financas/resumo, /mensal, /anual)
 * - Export de tipos duplicados em PageHeader
 * - FinancasMensal importa BaseData e usa componentes requeridos
 * - ModalTransacao com footer sticky
 * - Uso do util de PDF (exportTransactionsPDF)
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const srcDir = path.join(root, 'src');

function globTsx(dir, acc=[]) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) globTsx(p, acc);
    else if (/\.(ts|tsx|mts|cts)$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

function readSafe(file) {
  try { return fs.readFileSync(file, 'utf8'); }
  catch { return ''; }
}

function section(title) {
  console.log('\n' + '─'.repeat(72));
  console.log('■ ' + title);
  console.log('─'.repeat(72));
}

const files = globTsx(srcDir);
const report = [];

// 1) Radix Select: <Select.Item value="">
section('Select vazio (Radix) — <Select.Item value="">');
{
  const offenders = [];
  for (const f of files) {
    const s = readSafe(f);
    // procura value="" ou value={""}
    if (s.match(/<\s*Select\.Item[^>]*\bvalue\s*=\s*["']{0,1}""/)) {
      offenders.push(f);
    }
  }
  if (offenders.length) {
    console.log('✗ Encontrado value="" em:');
    offenders.forEach(f => console.log('  - ' + path.relative(root, f)));
    report.push('Corrigir Select.Item: não usar value="" (use placeholder no Select.Value e mapear "Todas" para undefined).');
  } else {
    console.log('✓ Nenhum <Select.Item value=""> encontrado.');
  }
}

// 2) export default fora do top-level (heurística simples)
section('Export default fora do top-level (heurística)');
{
  const offenders = [];
  const blockRe = /(if|for|while|switch|try)\s*\([^)]*\)\s*{[^]*?export\s+default/;
  for (const f of files) {
    const s = readSafe(f);
    if (blockRe.test(s)) offenders.push(f);
  }
  if (offenders.length) {
    console.log('✗ "export default" encontrado dentro de bloco/escopo em:');
    offenders.forEach(f => console.log('  - ' + path.relative(root, f)));
    report.push('Mover "export default" para o top-level nos arquivos listados.');
  } else {
    console.log('✓ Nenhum export default fora do top-level detectado.');
  }
}

// 3) Toaster importado direto de sonner (fora de ui/Toasts.ts)
section('Toaster/sonner — import centralizado');
{
  const offenders = [];
  for (const f of files) {
    if (f.endsWith(path.join('components','ui','Toasts.ts'))) continue;
    const s = readSafe(f);
    if (s.match(/from\s+['"]sonner['"]/)) offenders.push(f);
  }
  if (offenders.length) {
    console.log('✗ Import de sonner fora de ui/Toasts.ts:');
    offenders.forEach(f => console.log('  - ' + path.relative(root, f)));
    report.push('Padronizar: importar { Toaster, toast } de "@/components/ui/Toasts".');
  } else {
    console.log('✓ Import de Toaster/sonner centralizado.');
  }
}

// 4) PeriodContext shim
section('PeriodContext shim (re-export)');
{
  const f = path.join(srcDir, 'contexts', 'PeriodContext.tsx');
  const s = readSafe(f).trim();
  const ok = s.includes("export { PeriodProvider, usePeriod } from '@/state/periodFilter'");
  if (!ok) {
    console.log('✗ PeriodContext.tsx não está reexportando do state/periodFilter.');
    report.push('Manter PeriodContext.tsx apenas como shim: export { PeriodProvider, usePeriod } from "@/state/periodFilter";');
  } else {
    console.log('✓ Shim do PeriodContext OK.');
  }
}

// 5) Rotas obrigatórias em App.tsx
section('Rotas obrigatórias em App.tsx');
{
  const appFile = path.join(srcDir, 'App.tsx');
  const s = readSafe(appFile);
  const required = ['/dashboard', '/financas/resumo', '/financas/mensal', '/financas/anual'];
  const missing = required.filter(r => !s.includes(r));
  if (missing.length) {
    console.log('✗ Rotas ausentes em App.tsx: ' + missing.join(', '));
    report.push('Adicionar rotas ausentes em App.tsx: ' + missing.join(', '));
  } else {
    console.log('✓ Todas as rotas obrigatórias presentes.');
  }
}

// 6) PageHeader exports duplicados
section('PageHeader — export de tipos duplicados');
{
  const f = path.join(srcDir, 'components', 'PageHeader.tsx');
  const s = readSafe(f);
  const matches = (s.match(/export\s+type\s*{[^}]*PageHeaderProps[^}]*}/g) || []).length;
  if (matches > 1) {
    console.log('✗ PageHeader.tsx possui export type duplicado de PageHeaderProps.');
    report.push('Remover export type duplicado em PageHeader.tsx (deixar apenas um).');
  } else {
    console.log('✓ PageHeader exports OK.');
  }
}

// 7) FinancasMensal — imports essenciais
section('FinancasMensal — imports essenciais');
{
  const f = path.join(srcDir, 'pages', 'FinancasMensal.tsx');
  const s = readSafe(f);
  const need = [
    /CategoryPicker/,
    /EmptyState/,
    /Skeleton/,
    /BaseData/
  ];
  const missing = need.filter(rx => !rx.test(s)).map(rx=> String(rx).slice(1,-1));
  if (missing.length) {
    console.log('✗ FinancasMensal sem referências: ' + missing.join(', '));
    report.push('FinancasMensal.tsx deve importar/usar: ' + missing.join(', '));
  } else {
    console.log('✓ FinancasMensal com imports essenciais.');
  }
}

// 8) ModalTransacao — footer sticky
section('ModalTransacao — footer sticky');
{
  const f = path.join(srcDir, 'components', 'ModalTransacao.tsx');
  const s = readSafe(f);
  const hasSticky = /sticky\s+bottom-0/.test(s) && /overflow-y-auto/.test(s);
  if (!hasSticky) {
    console.log('✗ ModalTransacao sem footer sticky/scrollable content.');
    report.push('ModalTransacao: aplicar layout com overflow-y-auto no conteúdo e footer sticky bottom-0.');
  } else {
    console.log('✓ ModalTransacao com footer sticky.');
  }
}

// 9) PDF util — referenciado
section('PDF util — exportTransactionsPDF referenciado');
{
  const uses = [];
  for (const f of files) {
    const s = readSafe(f);
    if (s.includes('exportTransactionsPDF(')) uses.push(f);
  }
  if (!uses.length) {
    console.log('✗ Nenhuma chamada a exportTransactionsPDF encontrada.');
    report.push('Substituir botões "Exportar CSV" por "Exportar PDF" chamando exportTransactionsPDF(...).');
  } else {
    console.log('✓ exportTransactionsPDF utilizado em:');
    uses.forEach(f => console.log('  - ' + path.relative(root, f)));
  }
}

// Resumo
console.log('\n' + '='.repeat(72));
if (report.length === 0) {
  console.log('✅ Verificação concluída sem pendências críticas.');
} else {
  console.log('⚠️  Pendências encontradas:');
  report.forEach((r, i) => console.log(`${i+1}. ${r}`));
  console.log('\nSugestão: aplique correções nos pontos acima e rode novamente:');
  console.log('  npm run lint -- --fix && npm run typecheck && npm run build');
}
console.log('='.repeat(72));

process.exit(0);

