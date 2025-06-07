import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Fallback wallet data
const fallbackWallets = Array.from({ length: 100 }, (_, i) => {
  const clusters = ["whale", "active", "dormant", "exchange", "regular", "miner", "mixer"] as const
  const cluster = clusters[Math.floor(Math.random() * clusters.length)]

  return {
    address: `wallet_${i}_${Math.random().toString(36).substring(7)}`,
    balance: Math.random() * 1000,
    txCount: Math.floor(Math.random() * 100),
    avgTxValue: Math.random() * 50,
    txFrequency: Math.random() * 10,
    mixingScore: cluster === "mixer" ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3,
    exchangeScore: cluster === "exchange" ? 0.7 + Math.random() * 0.3 : Math.random() * 0.4,
    cluster,
    confidence: 0.5 + Math.random() * 0.5,
    lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    x: Math.random() * 800,
    y: Math.random() * 400,
    size: Math.random() * 20 + 5,
  }
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clusterType = searchParams.get("cluster")
  const limit = Number.parseInt(searchParams.get("limit") || "1000")

  try {
    // Check if tables exist first
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'wallets'
      )
    `

    if (!tableCheck[0].exists) {
      console.log("Wallets table not found, returning fallback data")
      const filteredWallets = clusterType ? fallbackWallets.filter((w) => w.cluster === clusterType) : fallbackWallets

      return NextResponse.json({
        wallets: filteredWallets.slice(0, limit),
        message: "Using fallback data. Please initialize database at /api/init-db",
      })
    }

    let query
    if (clusterType) {
      query = sql`
        SELECT 
          address,
          balance,
          transaction_count,
          COALESCE(avg_tx_value, 0) as avg_tx_value,
          COALESCE(tx_frequency, 0) as tx_frequency,
          COALESCE(exchange_interaction_score, 0) as exchange_interaction_score,
          COALESCE(mixing_score, 0) as mixing_score,
          cluster_type,
          cluster_confidence,
          COALESCE(ml_cluster_id, 0) as ml_cluster_id,
          last_active
        FROM wallets 
        WHERE cluster_type = ${clusterType}
        ORDER BY balance DESC
        LIMIT ${limit}
      `
    } else {
      query = sql`
        SELECT 
          address,
          balance,
          transaction_count,
          COALESCE(avg_tx_value, 0) as avg_tx_value,
          COALESCE(tx_frequency, 0) as tx_frequency,
          COALESCE(exchange_interaction_score, 0) as exchange_interaction_score,
          COALESCE(mixing_score, 0) as mixing_score,
          cluster_type,
          cluster_confidence,
          COALESCE(ml_cluster_id, 0) as ml_cluster_id,
          last_active
        FROM wallets 
        ORDER BY balance DESC
        LIMIT ${limit}
      `
    }

    const wallets = await query

    return NextResponse.json({
      wallets: wallets.map((wallet) => ({
        address: wallet.address,
        balance: Number(wallet.balance),
        txCount: wallet.transaction_count,
        avgTxValue: Number(wallet.avg_tx_value || 0),
        txFrequency: Number(wallet.tx_frequency || 0),
        exchangeScore: Number(wallet.exchange_interaction_score || 0),
        mixingScore: Number(wallet.mixing_score || 0),
        cluster: wallet.cluster_type,
        confidence: Number(wallet.cluster_confidence),
        mlClusterId: wallet.ml_cluster_id,
        lastActive: wallet.last_active,
        // Generate coordinates for visualization
        x: Math.random() * 800,
        y: Math.random() * 400,
        size: Math.log10(Number(wallet.balance) + 1) * 3 + 5,
      })),
    })
  } catch (error) {
    console.error("Database error:", error)
    // Return fallback data on error
    return NextResponse.json({
      wallets: fallbackWallets.slice(0, limit),
      message: "Database error, using fallback data",
    })
  }
}

export async function POST(request: Request) {
  try {
    const wallet = await request.json()

    const result = await sql`
      INSERT INTO wallets (
        address, balance, transaction_count, 
        cluster_type, cluster_confidence, first_seen, last_active
      )
      VALUES (
        ${wallet.address},
        ${wallet.balance || 0},
        ${wallet.transactionCount || 0},
        ${wallet.clusterType || "regular"},
        ${wallet.confidence || 0.5},
        ${wallet.firstSeen || "NOW()"},
        ${wallet.lastActive || "NOW()"}
      )
      ON CONFLICT (address) 
      DO UPDATE SET
        balance = EXCLUDED.balance,
        transaction_count = EXCLUDED.transaction_count,
        cluster_type = EXCLUDED.cluster_type,
        cluster_confidence = EXCLUDED.cluster_confidence,
        last_active = EXCLUDED.last_active,
        updated_at = NOW()
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to upsert wallet" }, { status: 500 })
  }
}
