import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock news data with sentiment analysis
    const mockNews = [
      {
        id: 1,
        title: "Bitcoin ETF Sees Record Inflows as Institutional Interest Surges",
        sentiment: 0.8,
        impact: "high",
        time: new Date(Date.now() - 2 * 3600000).toISOString(),
        source: "CoinDesk",
        url: "https://coindesk.com",
        summary: "Major Bitcoin ETFs recorded their highest single-day inflows...",
      },
      {
        id: 2,
        title: "Federal Reserve Signals Potential Rate Cuts in 2024",
        sentiment: 0.6,
        impact: "medium",
        time: new Date(Date.now() - 4 * 3600000).toISOString(),
        source: "Reuters",
        url: "https://reuters.com",
        summary: "The Federal Reserve hinted at possible interest rate reductions...",
      },
      {
        id: 3,
        title: "Major Cryptocurrency Exchange Reports Security Incident",
        sentiment: -0.7,
        impact: "high",
        time: new Date(Date.now() - 6 * 3600000).toISOString(),
        source: "CryptoNews",
        url: "https://cryptonews.com",
        summary: "A leading cryptocurrency exchange disclosed a security breach...",
      },
      {
        id: 4,
        title: "Corporate Bitcoin Adoption Reaches New Milestone",
        sentiment: 0.5,
        impact: "medium",
        time: new Date(Date.now() - 8 * 3600000).toISOString(),
        source: "Bloomberg",
        url: "https://bloomberg.com",
        summary: "More corporations are adding Bitcoin to their treasury reserves...",
      },
      {
        id: 5,
        title: "Regulatory Clarity Improves for Digital Assets",
        sentiment: 0.4,
        impact: "medium",
        time: new Date(Date.now() - 12 * 3600000).toISOString(),
        source: "Financial Times",
        url: "https://ft.com",
        summary: "New regulatory guidelines provide clearer framework...",
      },
    ]

    return NextResponse.json(mockNews)
  } catch (error) {
    console.error("Error fetching news data:", error)
    return NextResponse.json({ error: "Failed to fetch news data" }, { status: 500 })
  }
}
