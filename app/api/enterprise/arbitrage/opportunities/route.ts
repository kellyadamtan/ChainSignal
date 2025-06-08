import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const enterpriseId = searchParams.get("enterprise_id")
    const minSpread = Number.parseFloat(searchParams.get("min_spread") || "0.5")

    if (!enterpriseId) {
      return NextResponse.json({ error: "Enterprise ID required" }, { status: 400 })
    }

    // Fetch active arbitrage opportunities
    const opportunities = await sql`
      SELECT 
        id,
        currency_pair,
        buy_exchange,
        sell_exchange,
        buy_price,
        sell_price,
        spread_percentage,
        estimated_profit,
        volume_available,
        expires_at,
        created_at
      FROM arbitrage_opportunities 
      WHERE enterprise_id = ${enterpriseId}
        AND spread_percentage >= ${minSpread}
        AND expires_at > NOW()
      ORDER BY spread_percentage DESC
      LIMIT 50
    `

    return NextResponse.json({
      opportunities: opportunities.map((opp) => ({
        id: opp.id,
        currencyPair: opp.currency_pair,
        buyExchange: opp.buy_exchange,
        sellExchange: opp.sell_exchange,
        buyPrice: Number.parseFloat(opp.buy_price),
        sellPrice: Number.parseFloat(opp.sell_price),
        spreadPercentage: Number.parseFloat(opp.spread_percentage),
        estimatedProfit: Number.parseFloat(opp.estimated_profit),
        volumeAvailable: Number.parseFloat(opp.volume_available),
        expiresAt: opp.expires_at,
        createdAt: opp.created_at,
      })),
      total: opportunities.length,
      minSpread,
    })
  } catch (error) {
    console.error("Arbitrage opportunities error:", error)
    return NextResponse.json({ error: "Failed to fetch arbitrage opportunities" }, { status: 500 })
  }
}
