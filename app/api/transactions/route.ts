import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Number.parseInt(searchParams.get("limit") || "100")
  const offset = Number.parseInt(searchParams.get("offset") || "0")

  try {
    // Check if tables exist first
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions'
      )
    `

    if (!tableCheck[0].exists) {
      return NextResponse.json({
        transactions: [],
        total: 0,
        message: "Transactions table not found. Please initialize database.",
      })
    }

    const transactions = await sql`
      SELECT 
        hash,
        value,
        fee,
        input_count,
        output_count,
        size_bytes,
        timestamp,
        block_height
      FROM transactions 
      ORDER BY timestamp DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        hash: tx.hash,
        value: Number(tx.value),
        fee: Number(tx.fee),
        inputs: tx.input_count,
        outputs: tx.output_count,
        size: tx.size_bytes,
        timestamp: tx.timestamp,
        blockHeight: tx.block_height,
      })),
      total: transactions.length,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const transaction = await request.json()

    const result = await sql`
      INSERT INTO transactions (
        hash, value, fee, input_count, output_count, 
        size_bytes, timestamp, block_height
      )
      VALUES (
        ${transaction.hash},
        ${transaction.value},
        ${transaction.fee || 0},
        ${transaction.inputs},
        ${transaction.outputs},
        ${transaction.size || 0},
        ${transaction.timestamp || new Date().toISOString()},
        ${transaction.blockHeight || null}
      )
      RETURNING id
    `

    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to insert transaction" }, { status: 500 })
  }
}
