import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SessionProvider } from "next-auth/react"
import { SubscriptionProvider } from "@/hooks/use-subscription"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ChainSignal - Bitcoin Analytics Platform",
  description: "Advanced Bitcoin analytics, market intelligence, and blockchain insights",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <SubscriptionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <div className="min-h-screen bg-background">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </ThemeProvider>
          </SubscriptionProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
