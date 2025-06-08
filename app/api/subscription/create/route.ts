import { type NextRequest, NextResponse } from "next/server"
import { PayPalService } from "@/lib/paypal-service"
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-service"

export async function POST(request: NextRequest) {
  try {
    const { tier, userEmail } = await request.json()

    if (!tier || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.tier === tier)
    if (!plan || !plan.paypalPlanId) {
      return NextResponse.json({ error: "Invalid subscription plan" }, { status: 400 })
    }

    const paypalService = new PayPalService()
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    const subscription = await paypalService.createSubscription({
      planId: plan.paypalPlanId,
      userEmail,
      returnUrl: `${baseUrl}/subscription/success`,
      cancelUrl: `${baseUrl}/pricing`,
    })

    return NextResponse.json({
      subscriptionId: subscription.id,
      approvalUrl: subscription.approvalUrl,
    })
  } catch (error) {
    console.error("Subscription creation error:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
