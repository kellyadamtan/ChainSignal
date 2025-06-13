import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClientProviders } from "@/components/providers/client-providers"
import { ScriptProvider } from "@/components/providers/script-provider"

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
      <head>{/* Scripts are now handled by the ScriptProvider */}</head>
      <body className={inter.className}>
        <ClientProviders>
          <ScriptProvider />
          <div className="min-h-screen bg-background">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ClientProviders>
      </body>
    </html>
  )
}
