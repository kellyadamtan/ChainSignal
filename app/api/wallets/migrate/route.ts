import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST() {
  try {
    // Add missing columns to existing wallets table
    await sql`
      ALTER TABLE wallets 
      ADD COLUMN IF NOT EXISTS avg_tx_value DECIMAL(16, 8) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tx_frequency DECIMAL(8, 4) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS dormancy_period INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS exchange_interaction_score DECIMAL(3, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS mixing_score DECIMAL(3, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS ml_cluster_id INTEGER
    `

    // Update existing records with calculated values
    await sql`
      UPDATE wallets 
      SET 
        avg_tx_value = CASE 
          WHEN transaction_count > 0 THEN balance / transaction_count 
          ELSE 0 
        END,
        tx_frequency = CASE 
          WHEN cluster_type = 'active' THEN 0.8
          WHEN cluster_type = 'whale' THEN 0.3
          WHEN cluster_type = 'exchange' THEN 0.9
          WHEN cluster_type = 'miner' THEN 0.6
          WHEN cluster_type = 'mixer' THEN 0.7
          WHEN cluster_type = 'dormant' THEN 0.1
          ELSE 0.4
        END,
        exchange_interaction_score = CASE 
          WHEN cluster_type = 'exchange' THEN 0.9
          WHEN cluster_type = 'active' THEN 0.4
          WHEN cluster_type = 'whale' THEN 0.6
          ELSE 0.2
        END,
        mixing_score = CASE 
          WHEN cluster_type = 'mixer' THEN 0.9
          WHEN cluster_type = 'whale' THEN 0.3
          WHEN cluster_type = 'active' THEN 0.2
          ELSE 0.1
        END
      WHERE avg_tx_value IS NULL OR avg_tx_value = 0
    `

    return NextResponse.json({
      success: true,
      message: "Database migration completed successfully",
      details: "Added missing columns and updated existing records",
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        error: "Failed to migrate database",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
