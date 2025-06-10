import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock on-chain data (in production, use Glassnode, CryptoQuant, or similar)
    const mockData = {
      hashRate: {
        current: 450000000, // TH/s
        change24h: 2.3,
      },
      difficulty: {
        current: 62000000000000,
        nextAdjustment: -1.2,
        blocksUntilAdjustment: 1250,
      },
      mempool: {
        size: 45000,
        fees: {
          fast: 25,
          medium: 15,
          slow: 8,
        },
      },
      addresses: {
        active: 950000,
        new: 125000,
      },
      whaleTransactions: [
        {
          hash: "abc123...",
          amount: 1250.5,
          from: "exchange",
          to: "unknown",
          timestamp: Date.now() - 3600000,
        },
        {
          hash: "def456...",
          amount: 2100.0,
          from: "whale",
          to: "exchange",
          timestamp: Date.now() - 7200000,
        },
      ],
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching on-chain data:", error)
    return NextResponse.json({ error: "Failed to fetch on-chain data" }, { status: 500 })
  }
}
