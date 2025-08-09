import { webcrypto } from 'node:crypto'

if (!globalThis.crypto?.getRandomValues) {
  // @ts-ignore
  globalThis.crypto = webcrypto
}

