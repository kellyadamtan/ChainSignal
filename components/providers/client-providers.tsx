"use client"

import { useState, useEffect } from "react"
import type React from "react"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SubscriptionProvider } from "@/hooks/use-subscription"
import { LegalUpdateAlert } from "@/components/legal-update-alert"
import { ErrorBoundary } from "@/components/error-boundary"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  // Use state to control mounting to prevent hydration issues
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ErrorBoundary>
      <SessionProvider>
        <SubscriptionProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
            {mounted && <LegalUpdateAlert />}
            <Toaster />
          </ThemeProvider>
        </SubscriptionProvider>
      </SessionProvider>
    </ErrorBoundary>
  )
}
