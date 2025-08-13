import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import ts from 'typescript'

const DRY_RUN = process.argv.includes('--dry-run')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const SRC_DIR = path.resolve(__dirname, '../src')
const IGNORED = new Set(['node_modules', 'supabase', 'public', 'backups'])

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED.has(entry.name)) continue
      files.push(...(await collectFiles(path.join(dir, entry.name))))
    } else if (entry.isFile()) {
      if (/\.tsx?$/.test(entry.name)) files.push(path.join(dir, entry.name))
    }
  }
  return files
}

function rewriteImports(filePath: string, sourceText: string) {
  const sourceFile = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true)
  const edits: { start: number; end: number; text: string; old: string }[] = []
  function visit(node: ts.Node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        const spec = node.moduleSpecifier
        const value = spec.text
        if (value.startsWith('..')) {
          const absolute = path.resolve(path.dirname(filePath), value)
          const rel = path.relative(SRC_DIR, absolute)
          if (!rel.startsWith('..')) {
            const newPath = '@/' + rel.replace(/\\/g, '/')
            edits.push({
              start: spec.getStart() + 1,
              end: spec.getEnd() - 1,
              text: newPath,
              old: value,
            })
          }
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  if (edits.length === 0) return null
  let updated = sourceText
  for (const edit of edits.sort((a, b) => b.start - a.start)) {
    updated = updated.slice(0, edit.start) + edit.text + updated.slice(edit.end)
  }
  return { updated, edits }
}

async function main() {
  const files = await collectFiles(SRC_DIR)
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8')
    const result = rewriteImports(file, text)
    if (result) {
      for (const edit of result.edits) {
        console.log(`${file}: '${edit.old}' -> '${edit.text}'`)
      }
      if (!DRY_RUN) {
        await fs.writeFile(file, result.updated)
      }
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

