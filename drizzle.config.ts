import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema:    './lib/db/schema.ts',
  out:       './drizzle/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    // Use direct connection (not pooled) for migrations
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict:  true,
})
