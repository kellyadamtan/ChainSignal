import { NextResponse } from "next/server"
import { cryptoAPIsService } from "@/lib/crypto-apis"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const period = (searchParams.get("period") as any) || "1hour"
  const hours = Number.parseInt(searchParams.get("hours") || "24")

  try {
    // Check rate limits
    if (cryptoAPIsService.isRateLimited()) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          rateLimitInfo: cryptoAPIsService.getRateLimitInfo(),
        },
        { status: 429 },
      )
    }

    // Calculate time range
    const timeEnd = new Date().toISOString()
    const timeStart = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const historyData = await cryptoAPIsService.getOHLCVData("btc", period, timeStart, timeEnd)

    return NextResponse.json({
      data: historyData,
      rateLimitInfo: cryptoAPIsService.getRateLimitInfo(),
      _source: "cryptoapis",
    })
  } catch (error) {
    console.error("Failed to fetch Bitcoin price history from Crypto APIs:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        rateLimitInfo: cryptoAPIsService.getRateLimitInfo(),
      },
      { status: 500 },
    )
  }
}
