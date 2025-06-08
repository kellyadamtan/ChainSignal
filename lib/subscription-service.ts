export interface SubscriptionPlan {
  id: string
  name: string
  tier: "free" | "pro" | "enterprise"
  price: number
  interval: "month" | "year"
  features: {
    entityClassification: boolean
    riskMonitoring: boolean
    whaleTracker: boolean
    minerDashboard: boolean
    apiAccess: boolean
    customWebhooks: boolean
    prioritySupport: boolean
    alerts: number | "unlimited"
    historyRetention: string
    exportFeatures: boolean
  }
  paypalPlanId?: string
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "free",
    name: "Free",
    tier: "free",
    price: 0,
    interval: "month",
    features: {
      entityClassification: false,
      riskMonitoring: false,
      whaleTracker: false,
      minerDashboard: false,
      apiAccess: false,
      customWebhooks: false,
      prioritySupport: false,
      alerts: 5,
      historyRetention: "7 days",
      exportFeatures: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    tier: "pro",
    price: 49,
    interval: "month",
    features: {
      entityClassification: true,
      riskMonitoring: true,
      whaleTracker: true,
      minerDashboard: true,
      apiAccess: true,
      customWebhooks: false,
      prioritySupport: false,
      alerts: 50,
      historyRetention: "1 year",
      exportFeatures: true,
    },
    paypalPlanId: "P-5AB12345",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tier: "enterprise",
    price: 299,
    interval: "month",
    features: {
      entityClassification: true,
      riskMonitoring: true,
      whaleTracker: true,
      minerDashboard: true,
      apiAccess: true,
      customWebhooks: true,
      prioritySupport: true,
      alerts: "unlimited",
      historyRetention: "unlimited",
      exportFeatures: true,
    },
    paypalPlanId: "P-5CD67890",
  },
]

export interface User {
  id: string
  email: string
  subscriptionTier: "free" | "pro" | "enterprise"
  subscriptionStatus: "active" | "cancelled" | "past_due" | "trialing"
  paypalSubscriptionId?: string
  subscriptionExpiresAt?: Date
  createdAt: Date
}

export class SubscriptionService {
  static checkFeatureAccess(feature: keyof SubscriptionPlan["features"], user: User): boolean {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === user.subscriptionTier)
    if (!plan) return false

    // Check if subscription is active
    if (user.subscriptionTier !== "free" && user.subscriptionStatus !== "active") {
      return false
    }

    return plan.features[feature] as boolean
  }

  static getPlanByTier(tier: string): SubscriptionPlan | undefined {
    return SUBSCRIPTION_PLANS.find((p) => p.tier === tier)
  }

  static getFeatureLimits(user: User) {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === user.subscriptionTier)
    return plan?.features || SUBSCRIPTION_PLANS[0].features
  }
}
