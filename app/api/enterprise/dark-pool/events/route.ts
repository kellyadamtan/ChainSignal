import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const enterpriseId = searchParams.get("enterprise_id")
    const timeframe = searchParams.get("timeframe") || "24h"

    if (!enterpriseId) {
      return NextResponse.json({ error: "Enterprise ID required" }, { status: 400 })
    }

    // Calculate time filter
    const hoursBack = timeframe === "24h" ? 24 : timeframe === "7d" ? 168 : 24

    const events = await sql`
      SELECT 
        id,
        transaction_id,
        amount,
        confidence_score,
        pattern_type,
        exchanges_involved,
        detected_at,
        metadata
      FROM dark_pool_events 
      WHERE enterprise_id = ${enterpriseId}
        AND detected_at > NOW() - INTERVAL '${hoursBack} hours'
      ORDER BY detected_at DESC
      LIMIT 100
    `

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        transactionId: event.transaction_id,
        amount: Number.parseFloat(event.amount),
        confidenceScore: Number.parseFloat(event.confidence_score),
        patternType: event.pattern_type,
        exchangesInvolved: JSON.parse(event.exchanges_involved || "[]"),
        detectedAt: event.detected_at,
        metadata: JSON.parse(event.metadata || "{}"),
      })),
      total: events.length,
      timeframe,
    })
  } catch (error) {
    console.error("Dark pool events error:", error)
    return NextResponse.json({ error: "Failed to fetch dark pool events" }, { status: 500 })
  }
}
