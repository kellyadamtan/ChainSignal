import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ClientProviders } from "@/components/providers/client-providers"
import Script from "next/script"

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
      <head>
        {/* CookieYes Banner Script - Load with proper error handling */}
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/691a2f876ef768929cb0d286/script.js"
          strategy="afterInteractive"
          onError={(e) => {
            console.error("CookieYes script failed to load:", e)
          }}
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
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
