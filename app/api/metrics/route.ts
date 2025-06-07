import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Fallback data in case database is not initialized
const fallbackData = {
  currentMetrics: {
    btcPrice: 43250,
    hashRate: 450.2, // EH/s
    activeAddresses: 1234567,
    mempoolSize: 2.4, // MB
  },
  volumeData: [
    { time: "00:00", volume: 2400, value: 1200000 },
    { time: "04:00", volume: 1398, value: 980000 },
    { time: "08:00", volume: 9800, value: 2100000 },
    { time: "12:00", volume: 3908, value: 1800000 },
    { time: "16:00", volume: 4800, value: 2400000 },
    { time: "20:00", volume: 3800, value: 1900000 },
    { time: "24:00", volume: 4300, value: 2200000 },
  ],
  walletStats: {
    whale: { count: 5, balance: 5000, avgTxValue: 125.5 },
    active: { count: 25, balance: 2500, avgTxValue: 45.2 },
    dormant: { count: 15, balance: 1000, avgTxValue: 12.8 },
    exchange: { count: 8, balance: 3000, avgTxValue: 78.9 },
    regular: { count: 47, balance: 1500, avgTxValue: 23.4 },
    miner: { count: 12, balance: 2200, avgTxValue: 5.3 },
    mixer: { count: 6, balance: 800, avgTxValue: 15.7 },
  },
}

export async function GET() {
  try {
    // Check if tables exist first
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'network_metrics'
      )
    `

    if (!tableCheck[0].exists) {
      console.log("Database tables not found, returning fallback data")
      return NextResponse.json({
        ...fallbackData,
        message: "Using fallback data. Please initialize database at /api/init-db",
      })
    }

    // Get latest network metrics
    const metrics = await sql`
      SELECT 
        metric_name,
        metric_value,
        timestamp
      FROM network_metrics 
      WHERE timestamp >= NOW() - INTERVAL '1 hour'
      ORDER BY timestamp DESC
      LIMIT 10
    `

    // Get transaction volume for last 24 hours
    const volumeData = await sql`
      SELECT 
        date_trunc('hour', timestamp) as hour,
        COUNT(*) as transaction_count,
        SUM(value) as total_value,
        AVG(value) as avg_value
      FROM transactions 
      WHERE timestamp >= NOW() - INTERVAL '24 hours'
      GROUP BY date_trunc('hour', timestamp)
      ORDER BY hour
    `

    // Get active wallet count
    const walletStats = await sql`
      SELECT 
        cluster_type,
        COUNT(*) as count,
        SUM(balance) as total_balance,
        AVG(avg_tx_value) as avg_transaction_value,
        AVG(mixing_score) as avg_mixing_score
      FROM wallets 
      WHERE last_active >= NOW() - INTERVAL '24 hours'
      GROUP BY cluster_type
    `

    // Format response
    const response = {
      currentMetrics: {
        btcPrice:
          metrics.find((m) => m.metric_name === "btc_price")?.metric_value || fallbackData.currentMetrics.btcPrice,
        hashRate:
          metrics.find((m) => m.metric_name === "hash_rate")?.metric_value || fallbackData.currentMetrics.hashRate,
        activeAddresses:
          metrics.find((m) => m.metric_name === "active_addresses")?.metric_value ||
          fallbackData.currentMetrics.activeAddresses,
        mempoolSize:
          metrics.find((m) => m.metric_name === "mempool_size")?.metric_value ||
          fallbackData.currentMetrics.mempoolSize,
      },
      volumeData:
        volumeData.length > 0
          ? volumeData.map((v) => ({
              time: new Date(v.hour).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
              volume: Number(v.transaction_count),
              value: Number(v.total_value) * 43250, // Convert BTC to USD
            }))
          : fallbackData.volumeData,
      walletStats:
        walletStats.length > 0
          ? walletStats.reduce(
              (acc, stat) => {
                acc[stat.cluster_type] = {
                  count: Number(stat.count),
                  balance: Number(stat.total_balance),
                  avgTxValue: stat.avg_transaction_value,
                  mixingScore: stat.avg_mixing_score,
                }
                return acc
              },
              {} as Record<string, { count: number; balance: number; avgTxValue?: number; mixingScore?: number }>,
            )
          : fallbackData.walletStats,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Database error:", error)
    // Return fallback data on error
    return NextResponse.json({
      ...fallbackData,
      message: "Database error, using fallback data",
    })
  }
}

export async function POST(request: Request) {
  try {
    const { metricName, metricValue } = await request.json()

    await sql`
      INSERT INTO network_metrics (metric_name, metric_value, timestamp)
      VALUES (${metricName}, ${metricValue}, NOW())
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to insert metric" }, { status: 500 })
  }
}
