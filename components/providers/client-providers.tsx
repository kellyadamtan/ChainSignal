"use client"

import { SessionProvider } from "next-auth/react"
import { SubscriptionProvider } from "@/hooks/use-subscription"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SubscriptionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </SubscriptionProvider>
    </SessionProvider>
  )
}
