import fs from 'node:fs'

async function run() {
  let sharp: typeof import('sharp') | undefined
  try {
    sharp = (await import('sharp')).default
  } catch {
    console.log('Sharp não está instalado. Rode "npm i -D sharp" para habilitar a geração de ícones.')
    return
  }

  const icon512 = 'public/icons/icon-512.svg'
  if (fs.existsSync(icon512)) {
    console.log('Gerando public/icons/icon-512.png')
    await sharp(icon512).resize(512, 512).toFile('public/icons/icon-512.png')
    console.log('Gerando public/icons/icon-192.png')
    await sharp(icon512).resize(192, 192).toFile('public/icons/icon-192.png')
  } else {
    console.warn(`Arquivo não encontrado: ${icon512}`)
  }

  const maskable = 'public/icons/maskable-512.svg'
  if (fs.existsSync(maskable)) {
    console.log('Gerando public/icons/maskable-512.png')
    await sharp(maskable).resize(512, 512).toFile('public/icons/maskable-512.png')
  } else {
    console.warn(`Arquivo não encontrado: ${maskable}`)
  }

  const favicon = 'public/icons/favicon.svg'
  if (fs.existsSync(favicon)) {
    try {
      console.log('Gerando public/icons/favicon.ico')
      await sharp(favicon).resize(48, 48).toFile('public/icons/favicon.ico')
    } catch (err) {
      console.warn('Não foi possível gerar favicon.ico:', (err as Error).message)
    }
  } else {
    console.warn(`Arquivo não encontrado: ${favicon}`)
  }

  console.log('Ícones gerados.')
}

run()
