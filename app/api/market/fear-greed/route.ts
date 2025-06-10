import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Alternative.me Fear & Greed Index API
    const response = await fetch("https://api.alternative.me/fng/", {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Fear & Greed Index")
    }

    const data = await response.json()

    return NextResponse.json({
      value: Number.parseInt(data.data[0].value),
      classification: data.data[0].value_classification,
      timestamp: data.data[0].timestamp,
    })
  } catch (error) {
    console.error("Error fetching Fear & Greed Index:", error)

    // Return mock data as fallback
    return NextResponse.json({
      value: 45 + Math.floor(Math.random() * 20), // Random value between 45-65
      classification: "Neutral",
      timestamp: Math.floor(Date.now() / 1000).toString(),
    })
  }
}
