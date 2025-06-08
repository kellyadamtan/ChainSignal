"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, Check, Building, Network, Shield, Database } from "lucide-react"
import { useSubscription } from "@/hooks/use-subscription"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-service"

interface EnterprisePaywallProps {
  feature?: string
  title?: string
  description?: string
  icon?: React.ReactNode
}

export function EnterprisePaywall({
  feature = "enterpriseAnalytics",
  title = "Enterprise Analytics",
  description = "Advanced blockchain analytics and compliance tools for institutional clients",
  icon,
}: EnterprisePaywallProps) {
  const { upgradeUrl } = useSubscription()

  const getFeatureIcon = () => {
    if (icon) return icon
    switch (feature) {
      case "complianceEngine":
        return <Shield className="h-8 w-8 text-blue-500" />
      case "darkPoolDetection":
        return <Database className="h-8 w-8 text-red-500" />
      case "walletIntelligence":
        return <Network className="h-8 w-8 text-purple-500" />
      default:
        return <Building className="h-8 w-8 text-orange-500" />
    }
  }

  const enterprisePlan = SUBSCRIPTION_PLANS.find((plan) => plan.tier === "enterprise")

  if (!enterprisePlan) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-4xl w-full">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              {getFeatureIcon()}
              <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-1">
                <Lock className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <CardDescription className="text-lg mt-2">{description}</CardDescription>
          <Badge variant="secondary" className="mx-auto mt-4">
            Requires Enterprise Plan
          </Badge>
        </CardHeader>

        <CardContent>
          <div className="mx-auto max-w-md">
            <Card className="relative border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white">Enterprise Features</Badge>
              </div>

              <CardHeader className="text-center">
                <CardTitle className="text-xl">{enterprisePlan.name}</CardTitle>
                <div className="text-3xl font-bold">
                  ${enterprisePlan.price}
                  <span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Advanced Wallet Clustering</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Compliance Engine</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Dark Pool Detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Wallet Intelligence</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Arbitrage Monitoring</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Custom Webhooks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Priority Support</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  variant="default"
                  onClick={() => (window.location.href = upgradeUrl("enterprise"))}
                >
                  Upgrade to Enterprise
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              ✨ Start your free trial today • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
