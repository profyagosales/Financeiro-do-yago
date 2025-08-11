const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const

const missing = required.filter((key) => !process.env[key])

if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(', ')}`)
  process.exit(1)
}

console.log('All required environment variables are set.')
