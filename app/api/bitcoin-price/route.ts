import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { price, timestamp, change24h, volume24h } = await request.json()

    // Check if bitcoin_prices table exists, create if not
    await sql`
      CREATE TABLE IF NOT EXISTS bitcoin_prices (
        id SERIAL PRIMARY KEY,
        price DECIMAL(12, 2) NOT NULL,
        change_24h DECIMAL(8, 4),
        volume_24h DECIMAL(20, 2),
        timestamp TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `

    await sql`CREATE INDEX IF NOT EXISTS idx_bitcoin_prices_timestamp ON bitcoin_prices(timestamp)`

    // Insert price data
    await sql`
      INSERT INTO bitcoin_prices (price, change_24h, volume_24h, timestamp)
      VALUES (${price}, ${change24h || null}, ${volume24h || null}, ${new Date(timestamp).toISOString()})
    `

    // Clean up old data (keep only last 7 days)
    await sql`
      DELETE FROM bitcoin_prices 
      WHERE timestamp < NOW() - INTERVAL '7 days'
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to record Bitcoin price:", error)
    return NextResponse.json({ error: "Failed to record price" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const hours = Number.parseInt(searchParams.get("hours") || "24")
    const limit = Number.parseInt(searchParams.get("limit") || "1000")

    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bitcoin_prices'
      )
    `

    if (!tableCheck[0].exists) {
      return NextResponse.json({
        prices: [],
        message: "Bitcoin prices table not found",
      })
    }

    const prices = await sql`
      SELECT 
        price,
        change_24h,
        volume_24h,
        timestamp
      FROM bitcoin_prices 
      WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      prices: prices.map((p) => ({
        price: Number(p.price),
        change24h: p.change_24h ? Number(p.change_24h) : null,
        volume24h: p.volume_24h ? Number(p.volume_24h) : null,
        timestamp: p.timestamp,
      })),
    })
  } catch (error) {
    console.error("Failed to fetch Bitcoin prices:", error)
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 })
  }
}
