import { NextResponse } from "next/server"

// Mock data generator for testing
export async function GET() {
  // Generate a realistic Bitcoin price around $43,000
  const basePrice = 43000
  const variance = 2000 // +/- $2,000
  const currentPrice = basePrice + (Math.random() * variance * 2 - variance)

  // Generate a realistic 24h change between -5% and +5%
  const change24h = Math.random() * 10 - 5

  // Generate a timestamp for now
  const timestamp = Date.now()

  return NextResponse.json({
    price: currentPrice,
    change24h: change24h,
    volume24h: 25000000000 + Math.random() * 5000000000,
    timestamp: timestamp,
    marketCap: currentPrice * 19500000, // Approximate supply * price
    supply: 19500000,
    maxSupply: 21000000,
    _source: "mock",
  })
}
