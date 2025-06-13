import { NextResponse } from "next/server"
import {
  fetchBitcoinBlocks,
  calculateHashRate,
  fetchMiningPoolDistribution,
  fetchHistoricalHashRate,
} from "@/lib/bitquery-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "current"
    const days = Number.parseInt(searchParams.get("days") || "7", 10)
    const limit = Number.parseInt(searchParams.get("limit") || "100", 10)

    switch (type) {
      case "current": {
        const blocks = await fetchBitcoinBlocks(limit)
        const hashRateData = calculateHashRate(blocks)

        // Get the most recent hash rate data
        const currentHashRate = hashRateData[0]

        return NextResponse.json({
          hashRate: currentHashRate.hashRate,
          difficulty: currentHashRate.difficulty,
          blockHeight: currentHashRate.blockHeight,
          blockTime: currentHashRate.blockTime,
          timestamp: currentHashRate.timestamp,
        })
      }

      case "historical": {
        const historicalData = await fetchHistoricalHashRate(days)
        return NextResponse.json({ data: historicalData })
      }

      case "pools": {
        const poolData = await fetchMiningPoolDistribution(days)
        return NextResponse.json({ pools: poolData })
      }

      case "detailed": {
        const blocks = await fetchBitcoinBlocks(limit)
        const hashRateData = calculateHashRate(blocks)
        return NextResponse.json({ data: hashRateData })
      }

      default:
        return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
    }
  } catch (error) {
    console.error("Hash rate API error:", error)
    return NextResponse.json({ error: "Failed to fetch hash rate data" }, { status: 500 })
  }
}
