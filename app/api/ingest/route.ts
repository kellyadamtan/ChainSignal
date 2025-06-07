import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json()

    switch (type) {
      case "transaction":
        await sql`
          INSERT INTO transactions (
            hash, value, fee, input_count, output_count, 
            size_bytes, timestamp
          )
          VALUES (
            ${data.hash},
            ${data.value},
            ${data.fee || 0},
            ${data.inputs},
            ${data.outputs},
            ${data.size || 0},
            ${data.timestamp || new Date().toISOString()}
          )
          ON CONFLICT (hash) DO NOTHING
        `
        break

      case "block":
        await sql`
          INSERT INTO blocks (
            height, hash, previous_hash, timestamp, 
            difficulty, nonce, transaction_count, size_bytes
          )
          VALUES (
            ${data.height},
            ${data.hash},
            ${data.previousHash || null},
            ${data.timestamp || new Date().toISOString()},
            ${data.difficulty || null},
            ${data.nonce || null},
            ${data.transactions},
            ${data.size || null}
          )
          ON CONFLICT (height) DO NOTHING
        `
        break

      case "wallet_update":
        await sql`
          INSERT INTO wallets (
            address, balance, transaction_count, last_active
          )
          VALUES (
            ${data.address},
            ${data.balance},
            ${data.txCount},
            ${new Date().toISOString()}
          )
          ON CONFLICT (address) 
          DO UPDATE SET
            balance = EXCLUDED.balance,
            transaction_count = EXCLUDED.transaction_count,
            last_active = EXCLUDED.last_active,
            updated_at = NOW()
        `
        break

      case "network_metric":
        await sql`
          INSERT INTO network_metrics (metric_name, metric_value, timestamp)
          VALUES (${data.name}, ${data.value}, ${new Date().toISOString()})
        `
        break

      default:
        return NextResponse.json({ error: "Invalid data type" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Ingestion error:", error)
    return NextResponse.json({ error: "Failed to ingest data" }, { status: 500 })
  }
}
