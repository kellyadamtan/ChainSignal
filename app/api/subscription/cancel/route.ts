import { type NextRequest, NextResponse } from "next/server"
import { PayPalService } from "@/lib/paypal-service"

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, reason } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    const paypalService = new PayPalService()
    await paypalService.cancelSubscription(subscriptionId, reason)

    // In a real app, you would update the user's subscription status in your database
    // await updateUserSubscriptionStatus(userId, 'cancelled')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Subscription cancellation error:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
