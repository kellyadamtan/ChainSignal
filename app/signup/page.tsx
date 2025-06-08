"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowLeft, Lock, Star, Zap, Shield, Users } from "lucide-react"
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"

type Tier = "pro" | "enterprise"
type Step = "select-tier" | "payment" | "complete"

const tiers = {
  pro: {
    name: "Pro Plan",
    price: 49,
    description: "Perfect for individual traders and small teams",
    features: [
      "Entity Classification & Risk Monitoring",
      "Whale Transaction Tracking",
      "Advanced Analytics Dashboard",
      "API Access (1,000 calls/month)",
      "50 Custom Alerts",
      "1 Year Historical Data",
      "Email Support",
    ],
    icon: Star,
    color: "blue",
  },
  enterprise: {
    name: "Enterprise Plan",
    price: 299,
    description: "For institutions and large trading operations",
    features: [
      "All Pro Features",
      "Unlimited API Access",
      "Custom Webhooks & Integrations",
      "Unlimited Alerts",
      "Full Historical Data Access",
      "Priority Support & SLA",
      "Custom Compliance Reports",
      "Dedicated Account Manager",
    ],
    icon: Shield,
    color: "purple",
  },
}

export default function SignupPage() {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null)
  const [step, setStep] = useState<Step>("select-tier")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedTier = searchParams.get("plan") as Tier
  const [isLoginMode, setIsLoginMode] = useState(false)

  // Pre-select tier from URL parameter
  useState(() => {
    if (preselectedTier && tiers[preselectedTier]) {
      setSelectedTier(preselectedTier)
    }
  })

  const ProgressSteps = ({ currentStep }: { currentStep: Step }) => {
    const steps = [
      { id: "select-tier", name: "Plan Selection", icon: Users },
      { id: "payment", name: "Payment", icon: Lock },
      { id: "complete", name: "Confirmation", icon: CheckCircle },
    ]

    const currentIdx = steps.findIndex((step) => step.id === currentStep)

    return (
      <div className="mb-8">
        <nav className="flex items-center justify-center space-x-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            const isActive = idx <= currentIdx
            const isCurrent = idx === currentIdx

            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center space-x-2 ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isActive ? "border-blue-600 bg-blue-50" : "border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isCurrent ? "text-blue-600" : isActive ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${idx < currentIdx ? "bg-blue-600" : "bg-gray-300"}`} />
                )}
              </div>
            )
          })}
        </nav>
      </div>
    )
  }

  const TierSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setIsLoginMode(true)}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                isLoginMode ? "bg-primary text-primary-foreground" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLoginMode(false)}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                !isLoginMode ? "bg-primary text-primary-foreground" : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {isLoginMode ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Back to ChainSignal</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Log in to access your Bitcoin analytics dashboard</p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Your ChainSignal Account</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unlock advanced Bitcoin analytics, entity classification, and risk monitoring tools
            </p>
          </>
        )}
      </div>

      {isLoginMode ? (
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Login to Your Account</CardTitle>
              <CardDescription>Enter your credentials to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember" className="rounded" />
                    <label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.preventDefault()
                    router.push("/dashboard")
                  }}
                >
                  Login
                </Button>
              </form>
            </CardContent>
            <div className="p-6 border-t text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <button onClick={() => setIsLoginMode(false)} className="text-blue-600 hover:underline">
                Sign up
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {Object.entries(tiers).map(([key, tier]) => {
            const Icon = tier.icon
            const isSelected = selectedTier === key

            return (
              <Card
                key={key}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:shadow-md"
                }`}
                onClick={() => setSelectedTier(key as Tier)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          tier.color === "blue" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tier.name}</CardTitle>
                        <CardDescription>{tier.description}</CardDescription>
                      </div>
                    </div>
                    {key === "enterprise" && (
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold">${tier.price}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 ${
                      isSelected
                        ? tier.color === "blue"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-purple-600 hover:bg-purple-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    variant={isSelected ? "default" : "outline"}
                  >
                    {isSelected ? "Selected" : `Choose ${tier.name}`}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {selectedTier && !isLoginMode && (
        <div className="flex justify-center">
          <Button onClick={() => setStep("payment")} className="px-8 py-3 text-lg" size="lg">
            Continue to Payment
            <Zap className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )

  const PaymentForm = () => {
    const createSubscription = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/subscription/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier: selectedTier }),
        })

        if (!response.ok) {
          throw new Error("Failed to create subscription")
        }

        const { subscriptionId } = await response.json()
        return subscriptionId
      } catch (err) {
        setError(err instanceof Error ? err.message : "Payment failed")
        setLoading(false)
        throw err
      }
    }

    const onApprove = async (data: any) => {
      try {
        const response = await fetch("/api/subscription/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscriptionId: data.subscriptionID }),
        })

        if (!response.ok) {
          throw new Error("Subscription approval failed")
        }

        setStep("complete")
      } catch (err) {
        setError(err instanceof Error ? err.message : "Approval failed")
      } finally {
        setLoading(false)
      }
    }

    const tier = selectedTier ? tiers[selectedTier] : null
    if (!tier) return null

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => setStep("select-tier")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to plan selection
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Complete Your Subscription</span>
            </CardTitle>
            <CardDescription>
              You're subscribing to the <strong>{tier.name}</strong> for ${tier.price}/month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
              <div className="flex justify-between items-center">
                <span>{tier.name}</span>
                <span className="font-medium">${tier.price}/month</span>
              </div>
              <div className="text-sm text-gray-500 mt-2">14-day free trial • Cancel anytime</div>
            </div>

            <PayPalScriptProvider
              options={{
                clientId:
                  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
                  "ATAcTvH9uV-pDtsKIcAodp8Aw0jy8F03ZkFagzfb6-bAY3fOn7KJ7cKJK8jtmk92JNDBi7Cd7q058ruK",
                vault: true,
                intent: "subscription",
              }}
            >
              <PayPalButtons
                style={{
                  layout: "vertical",
                  color: "blue",
                  shape: "rect",
                  label: "subscribe",
                  height: 45,
                }}
                createSubscription={createSubscription}
                onApprove={onApprove}
                onError={(err) => setError("Payment processing failed")}
                disabled={loading}
              />
            </PayPalScriptProvider>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Secure payment processed by PayPal</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const Confirmation = () => {
    const tier = selectedTier ? tiers[selectedTier] : null
    if (!tier) return null

    return (
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ChainSignal {tier.name}!</h2>
          <p className="text-lg text-gray-600">Your subscription has been activated successfully</p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-900 mb-4">What's Next?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Explore Entity Classification</h4>
                  <p className="text-sm text-gray-600">Analyze Bitcoin addresses and transaction patterns</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Set Up Risk Monitoring</h4>
                  <p className="text-sm text-gray-600">Configure alerts for high-risk transactions</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Access API Documentation</h4>
                  <p className="text-sm text-gray-600">Integrate ChainSignal data into your applications</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex-shrink-0 flex items-center justify-center">
                  <span className="text-blue-600 font-medium text-sm">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Join Our Community</h4>
                  <p className="text-sm text-gray-600">Connect with other Bitcoin analysts and traders</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button onClick={() => router.push("/dashboard")} className="px-8 py-3 text-lg" size="lg">
            Go to Dashboard
          </Button>
          <div className="text-sm text-gray-500">Need help? Contact our support team at support@chainsignal.com</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <ProgressSteps currentStep={step} />

        {step === "select-tier" && <TierSelection />}
        {step === "payment" && <PaymentForm />}
        {step === "complete" && <Confirmation />}
      </div>
    </div>
  )
}
