"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      // In a real app, this would fetch from your authentication system
      // For now, we'll use a mock user
      const mockUser: User = {
        id: "1",
        email: "user@example.com",
        subscriptionTier: "free",
        subscriptionStatus: "active",
        createdAt: new Date(),
      }
      setUser(mockUser)
    } catch (error) {
      console.error("Failed to load user:", error)
    } finally {
      setLoading(false)
    }
  }

  const hasFeatureAccess = (feature: keyof SubscriptionPlan["features"]): boolean => {
    if (!user) return false
    return SubscriptionService.checkFeatureAccess(feature, user)
  }

  const refreshUser = async () => {
    await loadUser()
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
