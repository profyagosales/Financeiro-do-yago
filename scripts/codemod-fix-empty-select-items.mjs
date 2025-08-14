import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "src");
const exts = new Set([".tsx", ".ts", ".jsx", ".js"]);

/** Varre todos os arquivos do src e aplica correções simples: 
 *  - <SelectItem value=""> -> <SelectItem value="Todas">
 *  - value={(algo ?? "")}  -> value={String(algo ?? "TokenSemVazio")}
 *  - value={""}            -> value={"TokenSemVazio"}
 */
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (exts.has(path.extname(entry.name))) fixFile(p);
  }
}

function fixFile(file) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;

  // 1) <SelectItem value="">
  src = src.replace(
    /<\s*SelectItem([^>]*?)value\s*=\s*""/g,
    (_m, attrs) => `<SelectItem${attrs}value="Todas"`
  );

  // 2) value={(algo ?? "")}
  src = src.replace(
    /value=\{\s*([^}]+?)\s*\?\?\s*""\s*\}/g,
    (_m, inner) => `value={String(${inner} ?? "TokenSemVazio")}`
  );

  // 3) value={""}
  src = src.replace(
    /value=\{\s*""\s*\}/g,
    'value={"TokenSemVazio"}'
  );

  if (src !== before) {
    fs.writeFileSync(file, src);
    console.log("✔ Corrigido:", file);
  }
}

walk(root);
console.log("Done.");
