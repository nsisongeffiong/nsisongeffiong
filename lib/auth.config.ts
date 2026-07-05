import type { NextAuthConfig } from 'next-auth'

// Edge-safe config shared by middleware and the full auth instance.
// Providers (and anything pulling in Node-only APIs like bcrypt) live in auth.ts only.
export const authConfig = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email
      return token
    },
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string
      return session
    },
  },
} satisfies NextAuthConfig
