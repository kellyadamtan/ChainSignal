"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useSession } from "next-auth/react"
import { type User, SubscriptionService, type SubscriptionPlan } from "@/lib/subscription-service"

interface SubscriptionContextType {
  user: User | null
  loading: boolean
  hasFeatureAccess: (feature: keyof SubscriptionPlan["features"]) => boolean
  refreshUser: () => Promise<void>
  upgradeUrl: (tier: "pro" | "enterprise") => string
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

interface SubscriptionProviderProps {
  children: ReactNode
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") {
      setLoading(true)
      return
    }

    if (status === "authenticated" && session?.user) {
      // Create user object from session data
      const sessionUser: User = {
        id: session.user.id || "1",
        email: session.user.email || "admin@chainsignal.com",
        subscriptionTier: (session.user as any).subscriptionTier || "enterprise",
        subscriptionStatus: "active",
        createdAt: new Date(),
      }
      setUser(sessionUser)
      setLoading(false)
    } else if (status === "unauthenticated") {
      // For unauthenticated users, create a free tier user
      const freeUser: User = {
        id: "guest",
        email: "guest@example.com",
        subscriptionTier: "free",
        subscriptionStatus: "active",
        createdAt: new Date(),
      }
      setUser(freeUser)
      setLoading(false)
    }
  }, [session, status])

  const hasFeatureAccess = (feature: keyof SubscriptionPlan["features"]): boolean => {
    if (!user) return false
    return SubscriptionService.checkFeatureAccess(feature, user)
  }

  const refreshUser = async () => {
    // Refresh would typically refetch user data from your backend
    // For now, we'll just reload from session
    if (session?.user) {
      const sessionUser: User = {
        id: session.user.id || "1",
        email: session.user.email || "admin@chainsignal.com",
        subscriptionTier: (session.user as any).subscriptionTier || "enterprise",
        subscriptionStatus: "active",
        createdAt: new Date(),
      }
      setUser(sessionUser)
    }
  }

  const upgradeUrl = (tier: "pro" | "enterprise"): string => {
    return `/pricing?plan=${tier}`
  }

  const value: SubscriptionContextType = {
    user,
    loading,
    hasFeatureAccess,
    refreshUser,
    upgradeUrl,
  }

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider")
  }
  return context
}

// Convenience hook for feature access
export function useFeatureAccess(feature: keyof SubscriptionPlan["features"]) {
  const { hasFeatureAccess } = useSubscription()
  return hasFeatureAccess(feature)
}
