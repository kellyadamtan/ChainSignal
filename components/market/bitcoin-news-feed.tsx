"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ExternalLinkIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  RefreshCwIcon,
  NewspaperIcon as NewsIcon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  BookmarkIcon,
} from "lucide-react"

interface NewsItem {
  id: number
  title: string
  summary: string
  sentiment: number
  impact: "high" | "medium" | "low"
  timestamp: string
  source: string
  url: string
  votes?: {
    positive?: number
    negative?: number
    saved?: number
  }
  currencies: string[]
  kind: string
}

interface BitcoinNewsFeedProps {
  expanded?: boolean
}

export default function BitcoinNewsFeed({ expanded = false }: BitcoinNewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("hot")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/market/cryptopanic-news?filter=${filter}&currencies=BTC`)
      const data = await response.json()

      if (data.success) {
        setNews(data.news)
        setLastUpdated(new Date())
      } else {
        throw new Error(data.error || "Failed to fetch news")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching Bitcoin news:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [filter])

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

  const getKindBadge = (kind: string) => {
    const colors = {
      news: "bg-blue-100 text-blue-800",
      media: "bg-purple-100 text-purple-800",
      blog: "bg-orange-100 text-orange-800",
    }
    return colors[kind as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  // Safe vote getter with defaults
  const getVotes = (item: NewsItem) => ({
    positive: item.votes?.positive || 0,
    negative: item.votes?.negative || 0,
    saved: item.votes?.saved || 0,
  })

  if (loading && news.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(expanded ? 8 : 4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <NewsIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Unable to load news</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchNews} variant="outline">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Bitcoin News Feed</h3>
          <p className="text-sm text-muted-foreground">
            Powered by CryptoPanic • {lastUpdated && `Updated ${lastUpdated.toLocaleTimeString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={setFilter} className="w-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hot">Hot</TabsTrigger>
              <TabsTrigger value="trending">Trending</TabsTrigger>
              <TabsTrigger value="latest">Latest</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={fetchNews} size="sm" variant="outline" disabled={loading}>
            <RefreshCwIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* News items */}
      <div className="space-y-4">
        {news.slice(0, expanded ? 20 : 6).map((item) => {
          const votes = getVotes(item)

          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getSentimentIcon(item.sentiment)}
                      <Badge variant="outline" className={getKindBadge(item.kind)}>
                        {item.kind.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className={getImpactColor(item.impact)}>
                        {item.impact.toUpperCase()}
                      </Badge>
                    </div>

                    <h4 className="font-semibold text-sm leading-tight line-clamp-2">{item.title}</h4>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <span>{item.timestamp}</span>
                      {item.url && (
                        <>
                          <span>•</span>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <ExternalLinkIcon className="h-3 w-3" />
                            Read more
                          </a>
                        </>
                      )}
                    </div>

                    {/* Voting stats with safe access */}
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1 text-green-600">
                        <ThumbsUpIcon className="h-3 w-3" />
                        <span>{votes.positive}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <ThumbsDownIcon className="h-3 w-3" />
                        <span>{votes.negative}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <BookmarkIcon className="h-3 w-3" />
                        <span>{votes.saved}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs font-medium">Sentiment: {item.sentiment}%</div>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.sentiment > 60 ? "bg-green-500" : item.sentiment < 40 ? "bg-red-500" : "bg-yellow-500"
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, item.sentiment))}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {expanded && news.length > 20 && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={fetchNews}>
            Load More News
          </Button>
        </div>
      )}

      {!expanded && (
        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(6, news.length)} of {news.length} news items • Real-time sentiment analysis • Updated
            every 5 minutes
          </p>
        </div>
      )}
    </div>
  )
}
