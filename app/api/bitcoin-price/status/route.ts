import { NextResponse } from "next/server"
import { bitcoinPriceSources } from "@/lib/bitcoin-price-sources"

export async function GET() {
  try {
    const sourceStatus = await bitcoinPriceSources.checkSourceStatus()

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sources: sourceStatus,
      summary: {
        total: sourceStatus.length,
        working: sourceStatus.filter((s) => s.status === "success").length,
        failed: sourceStatus.filter((s) => s.status === "error").length,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to check source status",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
