import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Simple test user for demo
        if (credentials.email === "admin@chainsignal.com" && credentials.password === "Adamtgi123$") {
          return {
            id: "1",
            email: "admin@chainsignal.com",
            name: "Admin User",
            subscriptionTier: "enterprise",
            enterpriseId: "1",
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = "1"
        session.user.subscriptionTier = "enterprise"
        session.user.enterpriseId = "1"
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.subscriptionTier = user.subscriptionTier
        token.enterpriseId = user.enterpriseId
      }
      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key",
}
