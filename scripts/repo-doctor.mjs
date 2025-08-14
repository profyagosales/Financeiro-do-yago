#!/usr/bin/env node
// Repo Doctor: auditoria e correções direcionadas para FY
// Uso: node scripts/repo-doctor.mjs
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const rd = (...p) => path.join(root, ...p);

const read = (f) => fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null;
const write = (f, s) => fs.writeFileSync(f, s, "utf8");
const exists = (f) => fs.existsSync(f);

const log = (...a) => console.log("🔎", ...a);
const fix = (...a) => console.log("✅", ...a);
const warn = (...a) => console.log("⚠️", ...a);

let dirty = false;
const saveIfChanged = (file, next) => {
  const prev = read(file);
  if (prev !== null && next != null && prev !== next) {
    write(file, next);
    dirty = true;
    fix("Atualizado:", path.relative(root, file));
  }
};

// --- 0) PeriodContext shim correto (evita import inexistente/duplicado) ----
(() => {
  const f = rd("src/contexts/PeriodContext.tsx");
  if (exists(f)) {
    let s = read(f);
    // Se tiver conflitos/remanescentes de implementação duplicada, força re-export:
    const desired = `// Re-export the actual implementation from state/periodFilter
export { PeriodProvider, usePeriod } from '@/state/periodFilter';
`;
    if (!/export\s+\{\s*PeriodProvider\s*,\s*usePeriod\s*\}\s*from\s*['"]@\/state\/periodFilter['"]/.test(s)) {
      s = desired;
      saveIfChanged(f, s);
    }
  } else {
    // Cria o shim se não existir
    const s = `// Re-export the actual implementation from state/periodFilter
export { PeriodProvider, usePeriod } from '@/state/periodFilter';
`;
    write(f, s);
    dirty = true;
    fix("Criado:", path.relative(root, f));
  }
})();

// --- 1) App usa TopNav, PeriodProvider, Toaster Sonner ----------
(() => {
  const f = rd("src/App.tsx");
  const s = read(f);
  if (!s) { warn("src/App.tsx não encontrado"); return; }
  let next = s;
  // Garante TopNav import
  if (!/from ['"]@\/components\/TopNav['"]/.test(next)) {
    if (exists(rd("src/components/TopNav.tsx"))) {
      next = next.replace(/(import .*?;\s*)+/, (m) => `${m}import TopNav from '@/components/TopNav';\n`);
    }
  }
  // Toaster do Sonner: garante import
  if (!/from ['"]sonner['"]/.test(next)) {
    next = next.replace(/(import .*?;\s*)+/, (m) => `${m}import { Toaster } from 'sonner';\n`);
  }
  // PeriodProvider import (do shim)
  if (!/from ['"]@\/contexts\/PeriodContext['"]/.test(next)) {
    next = next.replace(/(import .*?;\s*)+/, (m) => `${m}import { PeriodProvider } from '@/contexts/PeriodContext';\n`);
  }
  // Insere <TopNav /> logo acima das rotas se não existir
  if (!/<TopNav\s*\/>/.test(next) && /return\s*\(\s*<AuthProvider>[\s\S]*<\/AuthProvider>\s*\);/m.test(next)) {
    next = next.replace(/(<Router>[\s\S]*?<PeriodProvider>)/m, `$1{ /* Top navigation */ }\n          <TopNav />\n          `);
  }
  // Garante padding top do main
  next = next.replace(/<main([^>]*)>/, (m, a) => {
    return /pt-16/.test(a) ? m : `<main${a ? a.replace(/className="([^"]*)"/, (m2, c) => `className="${c} pt-16"`) : ` className="pt-16"`}>`;
  });
  saveIfChanged(f, next);
})();

// --- 2) Corrigir Selects com value="" em CategoryPicker/SourcePicker -----------
const fixSelectEmptyValues = (file, labelForAll = "Todas", valueForAll = "all") => {
  if (!exists(file)) return;
  let s = read(file);
  let next = s;
  // Caso <Select.Item value=""> sem valor -> usa label "Todas" / "all"
  next = next.replace(/<Select\.Item(\s+[^>]*)?\s+value\s*=\s*["']\s*["']/g, (m) => {
    return m.replace(/value\s*=\s*["']\s*["']/, `value="${valueForAll}"`);
  });
  // Garante onValueChange nunca receba string vazia: normaliza "" para valueForAll
  next = next.replace(/onValueChange=\{?\(?([a-zA-Z0-9_]+)\)?\s*=>\s*([^{}]*?)\}?}/g, (m, v, body) => {
    // injeta normalização simples
    if (!/const\s+_val/.test(m) && !/normalizeSelectValue/.test(m)) {
      return m.replace(
        /=>\s*/, 
        `=> { const _val = (${v} ?? '${valueForAll}') || '${valueForAll}'; `
      ).replace(/}\s*$/, `; }`);
    }
    return m;
  });
  // Placeholders que usam "" mudam para valueForAll
  next = next.replace(/value\s*=\s*""/g, `value="${valueForAll}"`);
  if (next !== s) {
    saveIfChanged(file, next);
  }
};
fixSelectEmptyValues(rd("src/components/CategoryPicker.tsx"));
fixSelectEmptyValues(rd("src/components/SourcePicker.tsx"), "Todas", "all");

// --- 3) ModalTransacao: footer sticky + conteúdo scrollável -------------------
(() => {
  const f = rd("src/components/ModalTransacao.tsx");
  if (!exists(f)) return;
  let s = read(f);
  let next = s;
  // Conteúdo com overflow
  if (!/overflow-y-auto/.test(next)) {
    next = next.replace(/(<DialogContent[^>]*>)/, `$1\n  <div className="overflow-y-auto max-h-[70vh] p-4">`);
    next = next.replace(/(<\/DialogContent>)/, `  </div>\n$1`);
  }
  // Footer sticky: procurar bloco de botões e envolver num sticky bottom
  if (!/sticky bottom-0/.test(next)) {
    next = next.replace(
      /(<div className="[^"]*?\bbottom-actions\b[^"]*">[\s\S]*?<\/div>)/m,
      `<div className="sticky bottom-0 bg-background/80 backdrop-blur p-4 border-t">$1</div>`
    );
    // Se não achar classe bottom-actions, tenta no botão de ação final
    if (!/sticky bottom-0/.test(next)) {
      next = next.replace(
        /(\/\* *actions *\*\/[\s\S]*?<div[^>]*>[\s\S]*?<\/div>)/m,
        `<div className="sticky bottom-0 bg-background/80 backdrop-blur p-4 border-t">$1</div>`
      );
    }
  }
  saveIfChanged(f, next);
})();

// --- 4) FinancasAnual: dark-mode text legível ---------------------------------
(() => {
  const f = rd("src/pages/FinancasAnual.tsx");
  if (!exists(f)) return;
  let s = read(f);
  let next = s
    .replace(/text-gray-400/g, "text-neutral-300/80")
    .replace(/text-gray-500/g, "text-muted-foreground")
    .replace(/border-gray-200/g, "border-white/10")
    .replace(/text-gray-200/g, "text-neutral-200");
  saveIfChanged(f, next);
})();

// --- 5) Milhas: garantir header brandeado e top-level exports -----------------
(() => {
  const pages = ["MilhasLivelo.tsx", "MilhasLatam.tsx", "MilhasAzul.tsx"].map(p => rd("src/pages", p));
  pages.forEach(f => {
    if (!exists(f)) return;
    let s = read(f);
    // Remover export dentro de bloco (sintoma comum)
    s = s.replace(/\n}\s*export\s+default/g, "\n}\nexport default");
    // Importar e usar MilesHeader
    if (!/MilesHeader/.test(s)) {
      if (exists(rd("src/components/miles/MilesHeader.tsx"))) {
        s = s.replace(/(import .*?;\s*)+/, (m) => `${m}import MilesHeader from '@/components/miles/MilesHeader';\n`);
        // Insere o header no topo do JSX se não houver
        s = s.replace(/return\s*\(\s*</, `return (\n  <>\n    <MilesHeader program="${/Livelo/.test(f) ? "livelo" : /Latam/.test(f) ? "latampass" : "azul"}" />\n  </>\n  <`);
        s = s.replace(`</>`, ``); // remove fragment extra se duplicado
      }
    }
    saveIfChanged(f, s);
  });
})();

// --- 6) Export PDF: garantir util + botão chama PDF ---------------------------
(() => {
  const util = rd("src/utils/pdf.ts");
  if (!exists(util)) return;
  const table = rd("src/components/TransactionsTable.tsx");
  if (!exists(table)) return;
  let s = read(table);
  if (!/exportTransactionsPDF/.test(s)) {
    s = s.replace(/(import .*?;\s*)+/, (m) => `${m}import { exportTransactionsPDF } from '@/utils/pdf';\n`);
  }
  // Troca qualquer label de CSV por PDF no botão
  s = s.replace(/Exportar CSV/g, "Exportar PDF");
  // Se não chamar a função, injeta chamada simples num handler "onExport"
  if (!/exportTransactionsPDF\(/.test(s)) {
    s = s.replace(/const onExport\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\}\s*;/, (m) => {
      return `const onExport = () => {
  try {
    exportTransactionsPDF(filteredRows ?? rows ?? [], currentFilters ?? {}, period ?? {});
  } catch (e) { console.error(e); }
};`;
    });
  }
  saveIfChanged(table, s);
})();

// --- 7) Verificações finais (somente logs) ------------------------------------
(() => {
  const checks = [
    ["TopNav", "src/components/TopNav.tsx"],
    ["PeriodContext shim", "src/contexts/PeriodContext.tsx"],
    ["Dashboard", "src/pages/HomeOverview.tsx"],
    ["FinancasMensal", "src/pages/FinancasMensal.tsx"],
    ["FinancasAnual", "src/pages/FinancasAnual.tsx"],
    ["TransactionsTable", "src/components/TransactionsTable.tsx"],
  ];
  checks.forEach(([name, file]) => {
    if (exists(rd(file))) log("OK:", name, "→", file);
    else warn("Falta:", name, "→", file);
  });
})();

if (!dirty) {
  log("Nenhuma alteração necessária pelo doctor.");
}

