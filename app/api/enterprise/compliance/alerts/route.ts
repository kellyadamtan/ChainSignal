import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const enterpriseId = searchParams.get("enterprise_id")
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    if (!enterpriseId) {
      return NextResponse.json({ error: "Enterprise ID required" }, { status: 400 })
    }

    // Fetch compliance alerts
    const alerts = await sql`
      SELECT 
        id,
        rule_name,
        transaction_id,
        wallet_address,
        amount,
        risk_score,
        severity,
        status,
        created_at,
        details
      FROM compliance_alerts 
      WHERE enterprise_id = ${enterpriseId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `

    return NextResponse.json({
      alerts: alerts.map((alert) => ({
        id: alert.id,
        ruleName: alert.rule_name,
        transactionId: alert.transaction_id,
        walletAddress: alert.wallet_address,
        amount: Number.parseFloat(alert.amount),
        riskScore: Number.parseFloat(alert.risk_score),
        severity: alert.severity,
        status: alert.status,
        createdAt: alert.created_at,
        details: JSON.parse(alert.details || "{}"),
      })),
      total: alerts.length,
    })
  } catch (error) {
    console.error("Compliance alerts error:", error)
    return NextResponse.json({ error: "Failed to fetch compliance alerts" }, { status: 500 })
  }
}
