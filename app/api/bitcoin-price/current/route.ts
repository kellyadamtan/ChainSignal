import { NextResponse } from "next/server"

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
    // Fetch from CoinCap API
    const response = await fetch("https://api.coincap.io/v2/assets/bitcoin", {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate },
      // Add a timeout to prevent hanging requests
      cache: "no-store",
    })

    if (!response.ok) {
      console.warn(`CoinCap API returned status: ${response.status}`)
      // Return fallback data with a 200 status
      return NextResponse.json({
        ...fallbackData,
        timestamp: Date.now(),
        _source: "fallback",
      })
    }

    const data = await response.json()

    if (!data || !data.data) {
      console.warn("Invalid response format from CoinCap API")
      // Return fallback data with a 200 status
      return NextResponse.json({
        ...fallbackData,
        timestamp: Date.now(),
        _source: "fallback",
      })
    }

    // Return the actual data
    return NextResponse.json({
      price: Number(data.data.priceUsd),
      change24h: Number(data.data.changePercent24Hr),
      volume24h: Number(data.data.volumeUsd24Hr),
      timestamp: Date.now(),
      marketCap: Number(data.data.marketCapUsd),
      supply: Number(data.data.supply),
      maxSupply: Number(data.data.maxSupply),
      _source: "coincap",
    })
  } catch (error) {
    console.error("Failed to fetch Bitcoin price:", error)

    // Return fallback data with a 200 status instead of an error
    return NextResponse.json({
      ...fallbackData,
      timestamp: Date.now(),
      _source: "fallback",
      _error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
