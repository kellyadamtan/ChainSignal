import { NextResponse } from "next/server"
import { bitcoinPriceSources } from "@/lib/bitcoin-price-sources"

// Cache control to prevent excessive API calls
export const revalidate = 30 // Revalidate every 30 seconds

export async function GET() {
  try {
    const priceData = await bitcoinPriceSources.fetchPriceWithFallback()

    return NextResponse.json({
      price: priceData.price,
      change24h: priceData.change24h,
      volume24h: priceData.volume24h,
      timestamp: priceData.timestamp,
      marketCap: priceData.marketCap,
      supply: priceData.supply,
      maxSupply: priceData.maxSupply,
      rank: 1, // Bitcoin is always rank 1
      symbol: "BTC",
      name: "Bitcoin",
      assetId: "btc",
      _source: priceData.source,
      _timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Failed to fetch Bitcoin price from all sources:", error)

    // Return emergency fallback data
    return NextResponse.json({
      price: 43250,
      change24h: 0,
      volume24h: 25000000000,
      timestamp: Date.now(),
      marketCap: 850000000000,
      supply: 19500000,
      maxSupply: 21000000,
      rank: 1,
      symbol: "BTC",
      name: "Bitcoin",
      assetId: "btc",
      _source: "emergency_fallback",
      _error: error instanceof Error ? error.message : "Unknown error",
      _timestamp: new Date().toISOString(),
    })
  }
}
