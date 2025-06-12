import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { userId, documentType, version, ipAddress, userAgent } = await request.json()

    // Get the version ID
    const versionResult = await sql`
      SELECT id FROM legal_versions 
      WHERE document_type = ${documentType} AND version = ${version}
      ORDER BY effective_date DESC 
      LIMIT 1
    `

    if (versionResult.length === 0) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    const versionId = versionResult[0].id

    // Record the acceptance
    await sql`
      INSERT INTO legal_acceptances (user_id, version_id, document_type, ip_address, user_agent)
      VALUES (${userId}, ${versionId}, ${documentType}, ${ipAddress}, ${userAgent})
      ON CONFLICT (user_id, version_id) DO UPDATE SET
        accepted_at = NOW(),
        ip_address = ${ipAddress},
        user_agent = ${userAgent}
    `

    // Log the acceptance
    await sql`
      INSERT INTO legal_audit_log (action, document_type, version, user_id, ip_address, details)
      VALUES ('accepted', ${documentType}, ${version}, ${userId}, ${ipAddress}, 
              ${JSON.stringify({ userAgent, timestamp: new Date().toISOString() })})
    `

    return NextResponse.json({ success: true, message: "Acceptance recorded" })
  } catch (error) {
    console.error("Error recording legal acceptance:", error)
    return NextResponse.json({ error: "Failed to record acceptance" }, { status: 500 })
  }
}
