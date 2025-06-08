interface PayPalConfig {
  clientId: string
  clientSecret: string
  environment: "sandbox" | "live"
  webhookId?: string
}

interface PayPalSubscriptionRequest {
  planId: string
  userEmail: string
  returnUrl: string
  cancelUrl: string
}

interface PayPalSubscriptionResponse {
  id: string
  status: string
  approvalUrl: string
}

export class PayPalService {
  private config: PayPalConfig

  constructor() {
    this.config = {
      clientId:
        process.env.PAYPAL_CLIENT_ID ||
        "ATAcTvH9uV-pDtsKIcAodp8Aw0jy8F03ZkFagzfb6-bAY3fOn7KJ7cKJK8jtmk92JNDBi7Cd7q058ruK",
      clientSecret:
        process.env.PAYPAL_CLIENT_SECRET ||
        "EN_xx3VqIgm_nxWznlhHs8OqMQkXFybe48eIoZup7cZ7qldJbG2g3IRreuRGNXi9IO16UaS9Vlmi3svu",
      environment: (process.env.PAYPAL_ENVIRONMENT as "sandbox" | "live") || "sandbox",
      webhookId: process.env.PAYPAL_WEBHOOK_ID,
    }
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")
    const baseUrl =
      this.config.environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com"

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    })

    if (!response.ok) {
      throw new Error("Failed to get PayPal access token")
    }

    const data = await response.json()
    return data.access_token
  }

  async createSubscription(request: PayPalSubscriptionRequest): Promise<PayPalSubscriptionResponse> {
    const accessToken = await this.getAccessToken()
    const baseUrl =
      this.config.environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com"

    const subscriptionData = {
      plan_id: request.planId,
      subscriber: {
        email_address: request.userEmail,
      },
      application_context: {
        brand_name: "ChainSignal",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: request.returnUrl,
        cancel_url: request.cancelUrl,
      },
    }

    const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(subscriptionData),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal subscription creation failed: ${error}`)
    }

    const subscription = await response.json()
    const approvalUrl = subscription.links.find((link: any) => link.rel === "approve")?.href

    return {
      id: subscription.id,
      status: subscription.status,
      approvalUrl: approvalUrl || "",
    }
  }

  async cancelSubscription(subscriptionId: string, reason = "User requested cancellation"): Promise<void> {
    const accessToken = await this.getAccessToken()
    const baseUrl =
      this.config.environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com"

    const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`PayPal subscription cancellation failed: ${error}`)
    }
  }

  async getSubscriptionDetails(subscriptionId: string): Promise<any> {
    const accessToken = await this.getAccessToken()
    const baseUrl =
      this.config.environment === "sandbox" ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com"

    const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get subscription details")
    }

    return response.json()
  }

  verifyWebhookSignature(headers: any, body: string): boolean {
    // In a real implementation, you would verify the webhook signature
    // using PayPal's webhook verification API
    return true
  }
}
