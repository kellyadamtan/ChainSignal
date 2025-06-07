import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Fallback mining pool data
const fallbackPools = [
  { pool: "Antpool", hashrate: 18.5, blocks: 45 },
  { pool: "Foundry USA", hashrate: 16.2, blocks: 38 },
  { pool: "F2Pool", hashrate: 13.8, blocks: 32 },
  { pool: "Binance Pool", hashrate: 11.4, blocks: 28 },
  { pool: "ViaBTC", hashrate: 9.7, blocks: 24 },
  { pool: "Poolin", hashrate: 8.3, blocks: 20 },
  { pool: "Others", hashrate: 22.1, blocks: 53 },
]

export async function GET() {
  try {
    // Check if tables exist first
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'mining_pools'
      )
    `

    if (!tableCheck[0].exists) {
      console.log("Mining pools table not found, returning fallback data")
      return NextResponse.json({
        pools: fallbackPools,
        message: "Using fallback data. Please initialize database at /api/init-db",
      })
    }

    const pools = await sql`
      SELECT 
        name,
        hash_rate_percentage,
        blocks_mined_24h,
        total_blocks_mined,
        last_block_timestamp
      FROM mining_pools 
      ORDER BY hash_rate_percentage DESC
    `

    return NextResponse.json({
      pools: pools.map((pool) => ({
        pool: pool.name,
        hashrate: Number(pool.hash_rate_percentage),
        blocks: pool.blocks_mined_24h,
        totalBlocks: pool.total_blocks_mined,
        lastBlock: pool.last_block_timestamp,
      })),
    })
  } catch (error) {
    console.error("Database error:", error)
    // Return fallback data on error
    return NextResponse.json({
      pools: fallbackPools,
      message: "Database error, using fallback data",
    })
  }
}

export async function POST(request: Request) {
  try {
    const pool = await request.json()

    await sql`
      INSERT INTO mining_pools (
        name, hash_rate_percentage, blocks_mined_24h, 
        total_blocks_mined, last_block_timestamp
      )
      VALUES (
        ${pool.name},
        ${pool.hashRatePercentage},
        ${pool.blocksMined24h || 0},
        ${pool.totalBlocksMined || 0},
        ${pool.lastBlockTimestamp || "NOW()"}
      )
      ON CONFLICT (name) 
      DO UPDATE SET
        hash_rate_percentage = EXCLUDED.hash_rate_percentage,
        blocks_mined_24h = EXCLUDED.blocks_mined_24h,
        total_blocks_mined = EXCLUDED.total_blocks_mined,
        last_block_timestamp = EXCLUDED.last_block_timestamp,
        updated_at = NOW()
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to upsert mining pool" }, { status: 500 })
  }
}
