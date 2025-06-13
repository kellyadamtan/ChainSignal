"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

// Define subscription tiers
export type SubscriptionTier = "free" | "pro" | "enterprise"

// Define subscription context type
interface SubscriptionContextType {
  tier: SubscriptionTier
  isLoading: boolean
  hasAccess: (requiredTier: SubscriptionTier) => boolean
}

// Create context with default values
const SubscriptionContext = createContext<SubscriptionContextType>({
  tier: "free",
  isLoading: true,
  hasAccess: () => false,
})

// Custom hook to use subscription context
export const useSubscription = () => useContext(SubscriptionContext)

// Helper function to check feature access
export const useFeatureAccess = (requiredTier: SubscriptionTier) => {
  const { hasAccess, isLoading } = useSubscription()
  return { hasAccess: hasAccess(requiredTier), isLoading }
}

// Provider component
export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession()
  const [tier, setTier] = useState<SubscriptionTier>("free")
  const [isLoading, setIsLoading] = useState(true)

  // Determine subscription tier based on session
  useEffect(() => {
    try {
      if (status === "loading") {
        setIsLoading(true)
        return
      }

      setIsLoading(false)

      // Default to free tier if not authenticated
      if (status !== "authenticated" || !session) {
        setTier("free")
        return
      }

      // Check for enterprise users
      const email = session.user?.email?.toLowerCase() || ""
      if (email === "admin@chainsignal.com") {
        setTier("enterprise")
        return
      }

      // Check for pro users - this would typically come from a database
      // For now, we'll just check for specific test emails
      if (email.includes("pro@") || email.includes("test@")) {
        setTier("pro")
        return
      }

      // Default to free tier
      setTier("free")
    } catch (error) {
      console.error("Error determining subscription tier:", error)
      setTier("free")
      setIsLoading(false)
    }
  }, [session, status])

  // Function to check if user has access to a feature
  const hasAccess = (requiredTier: SubscriptionTier): boolean => {
    try {
      if (requiredTier === "free") return true
      if (requiredTier === "pro") return tier === "pro" || tier === "enterprise"
      if (requiredTier === "enterprise") return tier === "enterprise"
      return false
    } catch (error) {
      console.error("Error checking feature access:", error)
      return false
    }
  }

  return <SubscriptionContext.Provider value={{ tier, isLoading, hasAccess }}>{children}</SubscriptionContext.Provider>
}
