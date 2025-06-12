import { NextResponse } from "next/server"

const CRYPTOPANIC_API_KEY = "c5117a676612bea3fe72834b5fd8c6a81a8efd7b"
const CRYPTOPANIC_BASE_URL = "https://cryptopanic.com/api/developer/v2/posts/"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const currencies = searchParams.get("currencies") || "BTC"
    const kind = searchParams.get("kind") || "news"
    const filter = searchParams.get("filter") || "hot"

    const url = `${CRYPTOPANIC_BASE_URL}?auth_token=${CRYPTOPANIC_API_KEY}&currencies=${currencies}&kind=${kind}&filter=${filter}&public=true`

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "ChainSignal/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`CryptoPanic API error: ${response.status}`)
    }

    const data = await response.json()

    // Transform the data to match our component structure
    const transformedNews =
      data.results?.map((item: any) => ({
        id: item.id,
        title: item.title,
        summary: item.title, // CryptoPanic doesn't provide separate summary
        sentiment: calculateSentiment(item.votes),
        impact: determineImpact(item.votes),
        timestamp: formatTimestamp(item.published_at),
        source: item.source?.title || "CryptoPanic",
        url: item.url,
        votes: item.votes,
        currencies: item.currencies,
        kind: item.kind,
      })) || []

    return NextResponse.json({
      success: true,
      count: transformedNews.length,
      news: transformedNews,
      metadata: {
        next: data.next,
        previous: data.previous,
        count: data.count,
      },
    })
  } catch (error) {
    console.error("Error fetching CryptoPanic news:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch news data",
        news: [],
      },
      { status: 500 },
    )
  }
}

function calculateSentiment(votes: any): number {
  if (!votes) return 50

  const positive = votes.positive || 0
  const negative = votes.negative || 0
  const total = positive + negative

  if (total === 0) return 50

  // Calculate sentiment as percentage (0-100)
  return Math.round((positive / total) * 100)
}

function determineImpact(votes: any): "high" | "medium" | "low" {
  if (!votes) return "low"

  const total = (votes.positive || 0) + (votes.negative || 0) + (votes.saved || 0)

  if (total >= 50) return "high"
  if (total >= 20) return "medium"
  return "low"
}

function formatTimestamp(publishedAt: string): string {
  try {
    const date = new Date(publishedAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays} days ago`
    }
  } catch (error) {
    return "Recently"
  }
}
