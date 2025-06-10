"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLinkIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

interface NewsOverlayProps {
  data: any
  loading: boolean
  expanded?: boolean
}

export default function NewsOverlay({ data, loading, expanded = false }: NewsOverlayProps) {
  // Mock news data for demonstration
  const mockNews = [
    {
      id: 1,
      title: "Bitcoin ETF Sees Record Inflows",
      sentiment: 0.8,
      impact: "high",
      time: "2 hours ago",
      source: "CoinDesk",
      url: "#",
    },
    {
      id: 2,
      title: "Federal Reserve Hints at Rate Cuts",
      sentiment: 0.6,
      impact: "medium",
      time: "4 hours ago",
      source: "Reuters",
      url: "#",
    },
    {
      id: 3,
      title: "Major Exchange Reports Security Breach",
      sentiment: -0.7,
      impact: "high",
      time: "6 hours ago",
      source: "CryptoNews",
      url: "#",
    },
    {
      id: 4,
      title: "Institutional Adoption Continues to Grow",
      sentiment: 0.5,
      impact: "medium",
      time: "8 hours ago",
      source: "Bloomberg",
      url: "#",
    },
  ]

  const newsData = data || mockNews

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.3) return "text-green-600"
    if (sentiment < -0.3) return "text-red-600"
    return "text-yellow-600"
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0.3) return <TrendingUpIcon className="h-4 w-4" />
    if (sentiment < -0.3) return <TrendingDownIcon className="h-4 w-4" />
    return <div className="h-4 w-4 rounded-full bg-yellow-500" />
  }

  const getImpactBadge = (impact: string) => {
    const variants = {
      high: "destructive",
      medium: "secondary",
      low: "outline",
    }
    return variants[impact as keyof typeof variants] || "outline"
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(expanded ? 6 : 3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {newsData.slice(0, expanded ? 10 : 4).map((news: any) => (
        <Card key={news.id} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={getSentimentColor(news.sentiment)}>{getSentimentIcon(news.sentiment)}</span>
                  <Badge variant={getImpactBadge(news.impact) as any}>{news.impact} impact</Badge>
                  <span className="text-xs text-muted-foreground">{news.time}</span>
                </div>

                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{news.title}</h4>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{news.source}</span>
                  <ExternalLinkIcon className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {expanded && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            News sentiment analysis powered by AI • Updated every 15 minutes
          </p>
        </div>
      )}
    </div>
  )
}
