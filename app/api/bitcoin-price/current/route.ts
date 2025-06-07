import { NextResponse } from "next/server"
import { cryptoAPIsService } from "@/lib/crypto-apis"

// Cache control to prevent excessive API calls
export const revalidate = 30 // Revalidate every 30 seconds

// Fallback data in case the API is down
const fallbackData = {
  price: 43250,
  change24h: 0.5,
  volume24h: 25000000000,
  timestamp: Date.now(),
  marketCap: 850000000000,
  supply: 19500000,
  maxSupply: 21000000,
}

export async function GET() {
  try {
    // Check rate limits first
    if (cryptoAPIsService.isRateLimited()) {
      console.warn("Crypto APIs rate limit exceeded")
      return NextResponse.json({
        ...fallbackData,
        timestamp: Date.now(),
        _source: "fallback",
        _error: "Rate limit exceeded",
        _rateLimit: cryptoAPIsService.getRateLimitInfo(),
      })
    }

    // Fetch from Crypto APIs
    const bitcoinData = await cryptoAPIsService.getBitcoinData()

    if (!bitcoinData || !bitcoinData.cryptoData) {
      console.warn("Invalid response format from Crypto APIs")
      return NextResponse.json({
        ...fallbackData,
        timestamp: Date.now(),
        _source: "fallback",
        _error: "Invalid response format",
      })
    }

    const cryptoData = bitcoinData.cryptoData

    // Return the actual data with additional metadata
    return NextResponse.json({
      price: cryptoData.priceUsd,
      change24h: cryptoData.changePercent24h,
      volume24h: cryptoData.volumeUsd24h,
      timestamp: Date.now(),
      marketCap: cryptoData.marketCapUsd,
      supply: cryptoData.supply,
      maxSupply: cryptoData.maxSupply,
      rank: 1, // Bitcoin is always rank 1
      symbol: "BTC",
      name: bitcoinData.name,
      assetId: bitcoinData.assetId,
      _source: "cryptoapis",
      _rateLimit: cryptoAPIsService.getRateLimitInfo(),
    })
  } catch (error) {
    console.error("Failed to fetch Bitcoin price from Crypto APIs:", error)

    // Return fallback data with a 200 status instead of an error
    return NextResponse.json({
      ...fallbackData,
      timestamp: Date.now(),
      _source: "fallback",
      _error: error instanceof Error ? error.message : "Unknown error",
      _rateLimit: cryptoAPIsService.getRateLimitInfo(),
    })
  }
}
