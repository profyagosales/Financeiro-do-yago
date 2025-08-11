import { execSync } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const log = execSync('git log -n 20 --pretty=format:%s', {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean)

  const commits = log.map((c) => `- ${c}`).join('\n')

  const templatePath = path.join(__dirname, 'release-notes.md.ejs')
  const outputPath = path.resolve(__dirname, '../RELEASE_NOTES.md')

  const template = await fs.readFile(templatePath, 'utf8')
  const content = template.replace('<%= commits %>', commits)

  await fs.writeFile(outputPath, content)
  console.log(`Generated ${outputPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

