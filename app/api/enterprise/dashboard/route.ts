import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    // Check if user has enterprise access
    if (session.user.subscriptionTier !== "enterprise") {
      return NextResponse.json({ success: false, error: "Enterprise subscription required" }, { status: 403 })
    }

    // Get user's enterprise ID
    const userResult = await sql`
      SELECT enterprise_id FROM users WHERE email = ${session.user.email}
    `

    if (userResult.length === 0 || !userResult[0].enterprise_id) {
      return NextResponse.json({ success: false, error: "Enterprise account not found" }, { status: 404 })
    }

    const enterpriseId = userResult[0].enterprise_id

    // Get enterprise data
    const [complianceAlerts, darkPoolEvents, arbitrageOpportunities, walletIntelligence] = await Promise.all([
      sql`
        SELECT COUNT(*) as total, 
               COUNT(*) FILTER (WHERE severity = 'critical') as critical
        FROM compliance_alerts 
        WHERE enterprise_id = ${enterpriseId}
      `,
      sql`
        SELECT COUNT(*) as total,
               COUNT(*) FILTER (WHERE detected_at > NOW() - INTERVAL '24 hours') as new
        FROM dark_pool_events
        WHERE enterprise_id = ${enterpriseId}
      `,
      sql`
        SELECT COUNT(*) as total,
               SUM(estimated_profit) as potential_profit
        FROM arbitrage_opportunities
        WHERE enterprise_id = ${enterpriseId} AND expires_at > NOW()
      `,
      sql`
        SELECT COUNT(*) as total,
               COUNT(*) FILTER (WHERE risk_score > 0.7) as high_risk
        FROM enterprise_wallet_intelligence
        WHERE enterprise_id = ${enterpriseId}
      `,
    ])

    return NextResponse.json({
      success: true,
      enterpriseId,
      metrics: {
        complianceAlerts: {
          total: Number.parseInt(complianceAlerts[0]?.total || "0"),
          critical: Number.parseInt(complianceAlerts[0]?.critical || "0"),
        },
        darkPoolEvents: {
          total: Number.parseInt(darkPoolEvents[0]?.total || "0"),
          new: Number.parseInt(darkPoolEvents[0]?.new || "0"),
        },
        arbitrageOpportunities: {
          total: Number.parseInt(arbitrageOpportunities[0]?.total || "0"),
          potentialProfit: Number.parseFloat(arbitrageOpportunities[0]?.potential_profit || "0"),
        },
        walletIntelligence: {
          total: Number.parseInt(walletIntelligence[0]?.total || "0"),
          highRisk: Number.parseInt(walletIntelligence[0]?.high_risk || "0"),
        },
      },
    })
  } catch (error) {
    console.error("Enterprise dashboard error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch enterprise data" }, { status: 500 })
  }
}
