"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLinkIcon, TrendingUpIcon, TrendingDownIcon } from "lucide-react"

interface NewsItem {
  title: string
  summary: string
  sentiment: number
  impact: "high" | "medium" | "low"
  timestamp: string
  source: string
  url?: string
}

interface NewsOverlayProps {
  data?: NewsItem[]
  loading?: boolean
  expanded?: boolean
}

export default function NewsOverlay({ data, loading, expanded }: NewsOverlayProps) {
  // Mock data for demonstration
  const mockNews: NewsItem[] = [
    {
      title: "Bitcoin ETF Sees Record Inflows",
      summary: "Institutional investors pour $2.1B into Bitcoin ETFs this week",
      sentiment: 85,
      impact: "high",
      timestamp: "2 hours ago",
      source: "CoinDesk",
    },
    {
      title: "Federal Reserve Hints at Rate Cuts",
      summary: "Powell suggests potential monetary policy shifts affecting crypto markets",
      sentiment: 72,
      impact: "medium",
      timestamp: "4 hours ago",
      source: "Reuters",
    },
    {
      title: "Major Exchange Reports Security Upgrade",
      summary: "Enhanced security measures implemented across trading platforms",
      sentiment: 45,
      impact: "low",
      timestamp: "6 hours ago",
      source: "CryptoNews",
    },
    {
      title: "Regulatory Clarity Expected Soon",
      summary: "SEC chairman indicates clearer crypto guidelines coming",
      sentiment: 68,
      impact: "high",
      timestamp: "8 hours ago",
      source: "Bloomberg",
    },
  ]

  const newsData = data || mockNews

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 60) return <TrendingUpIcon className="h-4 w-4 text-green-500" />
    if (sentiment < 40) return <TrendingDownIcon className="h-4 w-4 text-red-500" />
    return <div className="h-4 w-4 rounded-full bg-yellow-500" />
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(expanded ? 6 : 3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {newsData.slice(0, expanded ? 10 : 4).map((item, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(item.sentiment)}
                  <h4 className="font-semibold text-sm leading-tight">{item.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{item.summary}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{item.source}</span>
                  <span>•</span>
                  <span>{item.timestamp}</span>
                  {item.url && <ExternalLinkIcon className="h-3 w-3" />}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge variant="outline" className={getImpactColor(item.impact)}>
                  {item.impact.toUpperCase()}
                </Badge>
                <div className="text-xs font-medium">
                  {item.sentiment > 60 ? "+" : item.sentiment < 40 ? "-" : ""}
                  {item.sentiment}%
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
