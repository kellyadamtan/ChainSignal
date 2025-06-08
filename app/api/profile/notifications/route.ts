import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const mockNotifications = {
      emailAlerts: true,
      priceAlerts: true,
      weeklyReports: false,
      marketingEmails: false,
      securityAlerts: true,
      transactionAlerts: true,
      systemUpdates: true,
    }

    return NextResponse.json({
      success: true,
      notifications: mockNotifications,
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch notification preferences" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate notification preferences
    const validKeys = [
      "emailAlerts",
      "priceAlerts",
      "weeklyReports",
      "marketingEmails",
      "securityAlerts",
      "transactionAlerts",
      "systemUpdates",
    ]

    for (const key of Object.keys(body)) {
      if (!validKeys.includes(key)) {
        return NextResponse.json({ success: false, error: `Invalid notification preference: ${key}` }, { status: 400 })
      }
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated successfully",
      notifications: body,
    })
  } catch (error) {
    console.error("Notifications update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update notification preferences" }, { status: 500 })
  }
}
