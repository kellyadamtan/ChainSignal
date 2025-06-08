import { type NextRequest, NextResponse } from "next/server"
import { PayPalService } from "@/lib/paypal-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headers = Object.fromEntries(request.headers.entries())

    const paypalService = new PayPalService()

    // Verify webhook signature
    const isValid = paypalService.verifyWebhookSignature(headers, body)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
    }

    const event = JSON.parse(body)

    switch (event.event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
        await handleSubscriptionActivated(event.resource)
        break

      case "BILLING.SUBSCRIPTION.CANCELLED":
        await handleSubscriptionCancelled(event.resource)
        break

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        await handlePaymentFailed(event.resource)
        break

      case "BILLING.SUBSCRIPTION.PAYMENT.SUCCESS":
        await handlePaymentSuccess(event.resource)
        break

      default:
        console.log("Unhandled webhook event:", event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleSubscriptionActivated(subscription: any) {
  console.log("Subscription activated:", subscription.id)
  // Update user subscription status in database
  // await updateUserSubscription(subscription.custom_id, 'active', subscription.id)
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log("Subscription cancelled:", subscription.id)
  // Update user subscription status in database
  // await updateUserSubscription(subscription.custom_id, 'cancelled')
}

async function handlePaymentFailed(subscription: any) {
  console.log("Payment failed for subscription:", subscription.id)
  // Update user subscription status and send notification
  // await updateUserSubscription(subscription.custom_id, 'past_due')
  // await sendPaymentFailedEmail(subscription.subscriber.email_address)
}

async function handlePaymentSuccess(subscription: any) {
  console.log("Payment successful for subscription:", subscription.id)
  // Ensure user has active access
  // await updateUserSubscription(subscription.custom_id, 'active')
}
