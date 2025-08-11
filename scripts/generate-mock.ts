import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const data = {
  categories: [
    { id: 1, name: 'Food' },
    { id: 2, name: 'Salary' },
  ],
  transactions: [
    {
      id: 1,
      categoryId: 1,
      description: 'Lunch',
      amount: -12.5,
      date: new Date().toISOString(),
    },
    {
      id: 2,
      categoryId: 2,
      description: 'Paycheck',
      amount: 2500,
      date: new Date().toISOString(),
    },
  ],
}

mkdirSync('.tmp', { recursive: true })
writeFileSync(join('.tmp', 'mock.json'), JSON.stringify(data, null, 2))
console.log('Mock data written to .tmp/mock.json')
