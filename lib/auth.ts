import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase()
        const password = String(credentials?.password ?? '')

        if (!email || !password) return null

        const adminEmails = (process.env.ADMIN_EMAILS ?? '')
          .split(',')
          .map((v) => v.trim().toLowerCase())
          .filter(Boolean)

        if (!adminEmails.includes(email)) return null

        const passwordHash = process.env.ADMIN_PASSWORD_HASH ?? ''
        if (!passwordHash) return null

        const valid = await bcrypt.compare(password, passwordHash)
        if (!valid) return null

        return { email }
      },
    }),
  ],
})
