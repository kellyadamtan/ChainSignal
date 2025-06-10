import { NextResponse } from "next/server"
import { fetchBitcoinMarketData, fetchHistoricalData, fetchGlobalData } from "@/lib/coingecko-api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const days = searchParams.get("days") || "30"

    const [marketData, historicalData, globalData] = await Promise.all([
      fetchBitcoinMarketData(),
      fetchHistoricalData(Number.parseInt(days)),
      fetchGlobalData(),
    ])

    return NextResponse.json({
      marketData,
      historicalData,
      globalData,
    })
  } catch (error) {
    console.error("Market API error:", error)
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 })
  }
}
