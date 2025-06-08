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

    // Get compliance rules
    const rules = await sql`
      SELECT * FROM compliance_rules 
      WHERE enterprise_id = ${enterpriseId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      rules,
    })
  } catch (error) {
    console.error("Compliance rules error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch compliance rules" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["rule_name", "conditions", "action", "severity"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 })
      }
    }

    // Create new rule
    const result = await sql`
      INSERT INTO compliance_rules (
        enterprise_id,
        rule_name,
        conditions,
        action,
        severity,
        is_active
      ) VALUES (
        ${enterpriseId},
        ${body.rule_name},
        ${JSON.stringify(body.conditions)},
        ${body.action},
        ${body.severity},
        ${body.is_active !== undefined ? body.is_active : true}
      )
      RETURNING *
    `

    return NextResponse.json({
      success: true,
      rule: result[0],
    })
  } catch (error) {
    console.error("Create compliance rule error:", error)
    return NextResponse.json({ success: false, error: "Failed to create compliance rule" }, { status: 500 })
  }
}
