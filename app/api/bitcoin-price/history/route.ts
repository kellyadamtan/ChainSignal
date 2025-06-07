import { NextResponse } from "next/server"
import { coinCapAPI } from "@/lib/coincap-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const interval = (searchParams.get("interval") as any) || "h1"
  const hours = Number.parseInt(searchParams.get("hours") || "24")

  try {
    // Check rate limits
    if (coinCapAPI.isRateLimited()) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          rateLimitInfo: coinCapAPI.getRateLimitInfo(),
        },
        { status: 429 },
      )
    }

    const end = Date.now()
    const start = end - hours * 60 * 60 * 1000

    const historyData = await coinCapAPI.getHistoricalData("bitcoin", interval, start, end)

    return NextResponse.json({
      data: historyData,
      rateLimitInfo: coinCapAPI.getRateLimitInfo(),
      _source: "coincap",
    })
  } catch (error) {
    console.error("Failed to fetch Bitcoin price history:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        rateLimitInfo: coinCapAPI.getRateLimitInfo(),
      },
      { status: 500 },
    )
  }
}
