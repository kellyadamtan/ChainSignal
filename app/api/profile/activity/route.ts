import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const type = searchParams.get("type") // filter by activity type

    // Mock activity data - in a real app, fetch from database
    const allActivities = [
      {
        id: 1,
        type: "login",
        action: "Login",
        details: "Signed in from Chrome on macOS",
        timestamp: "2024-12-15T10:30:00Z",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        location: "San Francisco, CA",
      },
      {
        id: 2,
        type: "profile_update",
        action: "Profile Update",
        details: "Updated bio and company information",
        timestamp: "2024-12-14T15:22:00Z",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        location: "San Francisco, CA",
      },
      {
        id: 3,
        type: "password_change",
        action: "Password Change",
        details: "Password was changed successfully",
        timestamp: "2024-12-13T09:15:00Z",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        location: "San Francisco, CA",
      },
      {
        id: 4,
        type: "login",
        action: "Login",
        details: "Signed in from Firefox on Windows",
        timestamp: "2024-12-12T14:45:00Z",
        ip: "10.0.0.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
        location: "New York, NY",
      },
      {
        id: 5,
        type: "security",
        action: "2FA Enabled",
        details: "Two-factor authentication was enabled",
        timestamp: "2024-12-10T11:30:00Z",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        location: "San Francisco, CA",
      },
      {
        id: 6,
        type: "api_access",
        action: "API Key Generated",
        details: "New API key was generated for wallet analysis",
        timestamp: "2024-12-08T16:20:00Z",
        ip: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        location: "San Francisco, CA",
      },
    ]

    // Filter by type if specified
    const filteredActivities = type ? allActivities.filter((activity) => activity.type === type) : allActivities

    // Paginate results
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      activities: paginatedActivities,
      pagination: {
        page,
        limit,
        total: filteredActivities.length,
        totalPages: Math.ceil(filteredActivities.length / limit),
        hasNext: endIndex < filteredActivities.length,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Activity fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch activity logs" }, { status: 500 })
  }
}
