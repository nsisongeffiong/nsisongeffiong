import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Use pooled connection for runtime queries
// Use direct connection for migrations (set in drizzle.config.ts)
const connectionString = process.env.DATABASE_URL_POOLED ?? process.env.DATABASE_URL!

// Prevent multiple connections in development (Next.js hot reload)
const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined
}

const client = globalForDb.client ?? postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
})

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client
}

export const db = drizzle(client, { schema })
export type DB = typeof db
