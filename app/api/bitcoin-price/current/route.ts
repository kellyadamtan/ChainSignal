import { NextResponse } from "next/server"

// CoinCap.io API configuration
const COINCAP_API_URL = "https://api.coincap.io/v2"
const COINCAP_API_KEY = "15ffe1ad7f39eb0c30c8ff3de8254dbe79585219bd801c31c4e0f3961ac7cb43"
const API_LABEL = "ChainSignal"

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
    // Fetch from CoinCap API with authentication
    const response = await fetch(`${COINCAP_API_URL}/assets/bitcoin`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${COINCAP_API_KEY}`,
        "User-Agent": API_LABEL,
        "X-Request-Id": crypto.randomUUID(),
      },
      next: { revalidate },
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn(`CoinCap API returned status: ${response.status}`)

      // Log rate limit information if available
      const rateLimitRemaining = response.headers.get("x-ratelimit-remaining")
      const rateLimitReset = response.headers.get("x-ratelimit-reset")

      if (rateLimitRemaining) {
        console.log(`Rate limit remaining: ${rateLimitRemaining}`)
      }
      if (rateLimitReset) {
        console.log(`Rate limit resets at: ${new Date(Number.parseInt(rateLimitReset) * 1000)}`)
      }

      // Return fallback data with a 200 status
      return NextResponse.json({
        ...fallbackData,
        timestamp: Date.now(),
        _source: "fallback",
        _error: `API returned ${response.status}`,
      })
    }

    const data = await response.json()

    if (!data || !data.data) {
      console.warn("Invalid response format from CoinCap API")
      return NextResponse.json({
        ...fallbackData,
        timestamp: Date.now(),
        _source: "fallback",
        _error: "Invalid response format",
      })
    }

    // Extract rate limit information
    const rateLimitRemaining = response.headers.get("x-ratelimit-remaining")
    const rateLimitReset = response.headers.get("x-ratelimit-reset")

    // Return the actual data with additional metadata
    return NextResponse.json({
      price: Number(data.data.priceUsd),
      change24h: Number(data.data.changePercent24Hr),
      volume24h: Number(data.data.volumeUsd24Hr),
      timestamp: data.timestamp || Date.now(),
      marketCap: Number(data.data.marketCapUsd),
      supply: Number(data.data.supply),
      maxSupply: Number(data.data.maxSupply),
      rank: Number(data.data.rank),
      symbol: data.data.symbol,
      name: data.data.name,
      _source: "coincap",
      _rateLimit: {
        remaining: rateLimitRemaining ? Number(rateLimitRemaining) : null,
        reset: rateLimitReset ? new Date(Number(rateLimitReset) * 1000) : null,
      },
    })
  } catch (error) {
    console.error("Failed to fetch Bitcoin price from CoinCap:", error)

    // Return fallback data with a 200 status instead of an error
    return NextResponse.json({
      ...fallbackData,
      timestamp: Date.now(),
      _source: "fallback",
      _error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
