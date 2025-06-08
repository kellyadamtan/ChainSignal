"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Check, Star, Zap, Shield, Users, Code, Bell, Database } from "lucide-react"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-service"

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (tier: "pro" | "enterprise") => {
    setLoading(tier)

    try {
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          userEmail: "user@example.com", // In real app, get from auth
        }),
      })

      if (response.ok) {
        const { approvalUrl } = await response.json()
        window.location.href = approvalUrl
      } else {
        throw new Error("Failed to create subscription")
      }
    } catch (error) {
      console.error("Subscription error:", error)
      alert("Failed to start subscription. Please try again.")
    } finally {
      setLoading(null)
    }
  }

  const getPrice = (plan: any) => {
    const price = isAnnual ? plan.price * 10 : plan.price // 2 months free annually
    return price
  }

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      entityClassification: <Users className="h-4 w-4" />,
      riskMonitoring: <Shield className="h-4 w-4" />,
      whaleTracker: <Zap className="h-4 w-4" />,
      apiAccess: <Code className="h-4 w-4" />,
      alerts: <Bell className="h-4 w-4" />,
      historyRetention: <Database className="h-4 w-4" />,
    }
    return icons[feature] || <Check className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock advanced Bitcoin analytics and monitoring capabilities
          </p>

          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm ${!isAnnual ? "font-semibold" : "text-muted-foreground"}`}>Monthly</span>
            <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
            <span className={`text-sm ${isAnnual ? "font-semibold" : "text-muted-foreground"}`}>Annual</span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTION_PLANS.map((plan, index) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.tier === "pro"
                  ? "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 scale-105"
                  : plan.tier === "enterprise"
                    ? "border-orange-200 bg-orange-50/50 dark:bg-orange-950/20"
                    : ""
              }`}
            >
              {plan.tier === "pro" && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-4xl font-bold mt-4">
                  {plan.price === 0 ? (
                    "Free"
                  ) : (
                    <>
                      ${getPrice(plan)}
                      <span className="text-lg font-normal text-muted-foreground">/{isAnnual ? "year" : "month"}</span>
                    </>
                  )}
                </div>
                {plan.price > 0 && isAnnual && (
                  <p className="text-sm text-muted-foreground">${plan.price}/month billed annually</p>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features List */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {getFeatureIcon("alerts")}
                    <span className="text-sm">
                      {typeof plan.features.alerts === "number"
                        ? `${plan.features.alerts} alerts/month`
                        : "Unlimited alerts"}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getFeatureIcon("historyRetention")}
                    <span className="text-sm">{plan.features.historyRetention} history</span>
                  </div>

                  {plan.features.entityClassification && (
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon("entityClassification")}
                      <span className="text-sm">Entity Classification</span>
                    </div>
                  )}

                  {plan.features.riskMonitoring && (
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon("riskMonitoring")}
                      <span className="text-sm">Risk Monitoring</span>
                    </div>
                  )}

                  {plan.features.whaleTracker && (
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon("whaleTracker")}
                      <span className="text-sm">Whale Tracker</span>
                    </div>
                  )}

                  {plan.features.apiAccess && (
                    <div className="flex items-center space-x-3">
                      {getFeatureIcon("apiAccess")}
                      <span className="text-sm">API Access</span>
                    </div>
                  )}

                  {plan.features.customWebhooks && (
                    <div className="flex items-center space-x-3">
                      <Code className="h-4 w-4" />
                      <span className="text-sm">Custom Webhooks</span>
                    </div>
                  )}

                  {plan.features.prioritySupport && (
                    <div className="flex items-center space-x-3">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">Priority Support</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full mt-6"
                  variant={plan.tier === "pro" ? "default" : plan.tier === "enterprise" ? "default" : "outline"}
                  disabled={loading === plan.tier}
                  onClick={() => {
                    if (plan.tier === "free") {
                      // Handle free plan signup
                      window.location.href = "/signup"
                    } else {
                      handleSubscribe(plan.tier as "pro" | "enterprise")
                    }
                  }}
                >
                  {loading === plan.tier
                    ? "Processing..."
                    : plan.tier === "free"
                      ? "Get Started Free"
                      : `Upgrade to ${plan.name}`}
                </Button>

                {plan.tier !== "free" && (
                  <p className="text-xs text-center text-muted-foreground mt-2">14-day free trial • Cancel anytime</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Feature Comparison</h2>
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-semibold">Features</th>
                        <th className="text-center p-4 font-semibold">Free</th>
                        <th className="text-center p-4 font-semibold bg-blue-50 dark:bg-blue-950/20">Pro</th>
                        <th className="text-center p-4 font-semibold">Enterprise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: "Basic Analytics", free: true, pro: true, enterprise: true },
                        { name: "Entity Classification", free: false, pro: true, enterprise: true },
                        { name: "Risk Monitoring", free: false, pro: true, enterprise: true },
                        { name: "Whale Tracker", free: false, pro: true, enterprise: true },
                        { name: "API Access", free: false, pro: true, enterprise: true },
                        { name: "Custom Webhooks", free: false, pro: false, enterprise: true },
                        { name: "Priority Support", free: false, pro: false, enterprise: true },
                      ].map((feature, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-4">{feature.name}</td>
                          <td className="text-center p-4">
                            {feature.free ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : "—"}
                          </td>
                          <td className="text-center p-4 bg-blue-50/50 dark:bg-blue-950/10">
                            {feature.pro ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : "—"}
                          </td>
                          <td className="text-center p-4">
                            {feature.enterprise ? <Check className="h-4 w-4 text-green-500 mx-auto" /> : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                question: "Can I change my plan anytime?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                question: "Is there a free trial?",
                answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to start.",
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards and PayPal through our secure payment processor.",
              },
              {
                question: "Can I cancel my subscription?",
                answer:
                  "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.",
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
