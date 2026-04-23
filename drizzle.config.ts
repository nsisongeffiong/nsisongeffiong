import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema:    './lib/db/schema.ts',
  out:       './drizzle/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    // Pooler URL resolves to IPv4; direct URL resolves to IPv6 (unusable on home network)
    url: process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL!,
  },
  verbose: true,
  strict:  true,
})
