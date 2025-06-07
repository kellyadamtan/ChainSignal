import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

// Fallback alert data
const fallbackAlerts = [
  {
    id: "1",
    name: "Large Transaction Alert",
    conditions: [{ metric: "value", operator: ">", value: "1000" }],
    channels: ["email"],
    alertType: "recurring",
    isActive: true,
    lastTriggered: null,
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Whale Movement",
    conditions: [{ metric: "value", operator: ">", value: "10000" }],
    channels: ["email", "webhook"],
    alertType: "recurring",
    isActive: true,
    lastTriggered: null,
    createdAt: new Date(),
  },
]

export async function GET() {
  try {
    // Check if tables exist first
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'alerts'
      )
    `

    if (!tableCheck[0].exists) {
      console.log("Alerts table not found, returning fallback data")
      return NextResponse.json({
        alerts: fallbackAlerts,
        message: "Using fallback data. Please initialize database at /api/init-db",
      })
    }

    const alerts = await sql`
      SELECT 
        id,
        name,
        conditions,
        channels,
        alert_type,
        is_active,
        last_triggered,
        created_at
      FROM alerts 
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      alerts: alerts.map((alert) => ({
        id: alert.id.toString(),
        name: alert.name,
        conditions: alert.conditions,
        channels: alert.channels,
        alertType: alert.alert_type,
        isActive: alert.is_active,
        lastTriggered: alert.last_triggered,
        createdAt: alert.created_at,
      })),
    })
  } catch (error) {
    console.error("Database error:", error)
    // Return fallback data on error
    return NextResponse.json({
      alerts: fallbackAlerts,
      message: "Database error, using fallback data",
    })
  }
}

export async function POST(request: Request) {
  try {
    const alert = await request.json()

    const result = await sql`
      INSERT INTO alerts (
        name, conditions, channels, alert_type, is_active
      )
      VALUES (
        ${alert.name},
        ${JSON.stringify(alert.conditions)},
        ${alert.channels},
        ${alert.alertType || "recurring"},
        ${alert.isActive !== false}
      )
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json()

    await sql`
      UPDATE alerts 
      SET 
        name = COALESCE(${updates.name}, name),
        conditions = COALESCE(${JSON.stringify(updates.conditions)}, conditions),
        channels = COALESCE(${updates.channels}, channels),
        is_active = COALESCE(${updates.isActive}, is_active),
        updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Alert ID required" }, { status: 400 })
    }

    await sql`DELETE FROM alerts WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 })
  }
}
