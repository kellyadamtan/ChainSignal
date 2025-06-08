import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "24h"

    // Convert timeframe to hours for database query
    let hours = 24
    switch (timeframe) {
      case "1h":
        hours = 1
        break
      case "24h":
        hours = 24
        break
      case "7d":
        hours = 24 * 7
        break
      case "30d":
        hours = 24 * 30
        break
      case "1y":
        hours = 24 * 365
        break
    }

    // Check if bitcoin_prices table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bitcoin_prices'
      )
    `

    if (!tableCheck[0].exists) {
      // Return sample data if table doesn't exist
      return NextResponse.json({
        data: generateSampleData(timeframe),
        source: "sample",
        message: "Using sample data - bitcoin_prices table not found",
      })
    }

    // Determine appropriate interval based on timeframe for data aggregation
    let interval = "1 hour"
    let limit = hours

    if (timeframe === "30d") {
      interval = "6 hours"
      limit = Math.ceil(hours / 6)
    } else if (timeframe === "1y") {
      interval = "1 day"
      limit = 365
    }

    // Query with time bucketing for appropriate data density
    const prices = await sql`
      WITH time_buckets AS (
        SELECT 
          time_bucket(${interval}::interval, timestamp) AS bucket_time,
          AVG(price) AS avg_price,
          SUM(COALESCE(volume_24h, 0)) AS volume
        FROM bitcoin_prices 
        WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
        GROUP BY bucket_time
        ORDER BY bucket_time
        LIMIT ${limit}
      )
      SELECT 
        bucket_time AS timestamp,
        avg_price AS price,
        volume
      FROM time_buckets
      ORDER BY timestamp
    `.catch((error) => {
      console.error("SQL error:", error)
      return []
    })

    // If no data or error, return sample data
    if (!prices || prices.length === 0) {
      return NextResponse.json({
        data: generateSampleData(timeframe),
        source: "sample",
        message: "Using sample data - no historical data available",
      })
    }

    // Format the data for the chart
    const data = prices.map((p) => ({
      timestamp: p.timestamp,
      price: Number(p.price),
      volume: Number(p.volume) || 0,
    }))

    return NextResponse.json({
      data,
      source: "database",
      timeframe,
      count: data.length,
    })
  } catch (error) {
    console.error("Failed to fetch Bitcoin price history:", error)

    // Return sample data on error
    const timeframe = new URL(request.url).searchParams.get("timeframe") || "24h"
    return NextResponse.json({
      data: generateSampleData(timeframe),
      source: "sample",
      error: "Error fetching historical data",
      message: "Using sample data due to error",
    })
  }
}

// Helper function to generate sample data if the database query fails
function generateSampleData(timeframe: string) {
  const now = new Date()
  const data = []
  let points = 24
  let interval = 60 * 60 * 1000 // 1 hour

  switch (timeframe) {
    case "1h":
      points = 60
      interval = 60 * 1000 // 1 minute
      break
    case "24h":
      points = 24
      interval = 60 * 60 * 1000 // 1 hour
      break
    case "7d":
      points = 168
      interval = 60 * 60 * 1000 // 1 hour
      break
    case "30d":
      points = 30
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
    case "1y":
      points = 365
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
  }

  let basePrice = 43250
  for (let i = points; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * interval).toISOString()
    const volatility = Math.random() * 1000 - 500
    const price = Math.max(basePrice + volatility, 30000)
    const volume = Math.random() * 1000000000 + 500000000

    data.push({
      timestamp,
      price: Math.round(price * 100) / 100,
      volume: Math.round(volume),
    })

    basePrice = price
  }

  return data
}
