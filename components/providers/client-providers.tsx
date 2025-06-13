"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SubscriptionProvider } from "@/hooks/use-subscription"
import { LegalUpdateAlert } from "@/components/legal-update-alert"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SubscriptionProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <LegalUpdateAlert />
          <Toaster />
        </ThemeProvider>
      </SubscriptionProvider>
    </SessionProvider>
  )
}
