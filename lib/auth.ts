import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import DiscordProvider from "next-auth/providers/discord"
import TwitterProvider from "next-auth/providers/twitter"
import LinkedInProvider from "next-auth/providers/linkedin"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID!,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider) {
          // Check if user exists in database
          const existingUser = await sql`
            SELECT id, email FROM users WHERE email = ${user.email}
          `

          if (existingUser.length === 0) {
            // Create new user
            await sql`
              INSERT INTO users (
                email, 
                name, 
                avatar_url, 
                provider, 
                provider_id,
                created_at,
                updated_at
              ) VALUES (
                ${user.email},
                ${user.name},
                ${user.image},
                ${account.provider},
                ${account.providerAccountId},
                NOW(),
                NOW()
              )
            `
          } else {
            // Update existing user with OAuth info
            await sql`
              UPDATE users 
              SET 
                name = ${user.name},
                avatar_url = ${user.image},
                provider = ${account.provider},
                provider_id = ${account.providerAccountId},
                updated_at = NOW()
              WHERE email = ${user.email}
            `
          }

          // Store OAuth account info
          await sql`
            INSERT INTO oauth_accounts (
              user_email,
              provider,
              provider_account_id,
              access_token,
              refresh_token,
              expires_at,
              token_type,
              scope,
              created_at
            ) VALUES (
              ${user.email},
              ${account.provider},
              ${account.providerAccountId},
              ${account.access_token},
              ${account.refresh_token},
              ${account.expires_at ? new Date(account.expires_at * 1000) : null},
              ${account.token_type},
              ${account.scope},
              NOW()
            )
            ON CONFLICT (user_email, provider) 
            DO UPDATE SET
              access_token = EXCLUDED.access_token,
              refresh_token = EXCLUDED.refresh_token,
              expires_at = EXCLUDED.expires_at,
              updated_at = NOW()
          `
        }
        return true
      } catch (error) {
        console.error("Sign in error:", error)
        return false
      }
    },
    async session({ session, token }) {
      if (session.user?.email) {
        try {
          const user = await sql`
            SELECT id, email, name, avatar_url, provider, subscription_tier, created_at
            FROM users 
            WHERE email = ${session.user.email}
          `

          if (user.length > 0) {
            session.user.id = user[0].id
            session.user.provider = user[0].provider
            session.user.subscriptionTier = user[0].subscription_tier || "free"
            session.user.createdAt = user[0].created_at
          }
        } catch (error) {
          console.error("Session callback error:", error)
        }
      }
      return session
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.provider = account.provider
        token.accessToken = account.access_token
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
