"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  RefreshCwIcon,
  TrendingUpIcon,
  NewspaperIcon as NewsIcon,
  ActivityIcon,
  AlertTriangleIcon,
  BrainIcon,
  BarChart3Icon,
} from "lucide-react"
import dynamic from "next/dynamic"

// Dynamic imports to prevent SSR issues
const AdvancedChart = dynamic(() => import("@/components/market/advanced-chart"), {
  ssr: false,
  loading: () => <Skeleton className="h-80 w-full" />,
})

const SentimentGauge = dynamic(() => import("@/components/market/sentiment-gauge"), {
  ssr: false,
  loading: () => <Skeleton className="h-32 w-full" />,
})

const NewsOverlay = dynamic(() => import("@/components/market/news-overlay"), {
  ssr: false,
  loading: () => <Skeleton className="h-40 w-full" />,
})

const OnChainMetrics = dynamic(() => import("@/components/market/onchain-metrics"), {
  ssr: false,
  loading: () => <Skeleton className="h-60 w-full" />,
})

const InstitutionalTracker = dynamic(() => import("@/components/market/institutional-tracker"), {
  ssr: false,
  loading: () => <Skeleton className="h-48 w-full" />,
})

interface MarketData {
  marketData: any
  historicalData: any
  globalData: any
  fearGreedIndex?: number
  onChainData?: any
  newsData?: any
  institutionalData?: any
}

export default function MarketPage() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState("30")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Chart overlay toggles
  const [showNews, setShowNews] = useState(true)
  const [showWhaleTransactions, setShowWhaleTransactions] = useState(true)
  const [showLiquidityHeatmap, setShowLiquidityHeatmap] = useState(false)
  const [showPatternRecognition, setShowPatternRecognition] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch multiple data sources in parallel
      const [marketResponse, fearGreedResponse, onChainResponse, newsResponse] = await Promise.allSettled([
        fetch(`/api/market/bitcoin?days=${timeframe}`),
        fetch("/api/market/fear-greed"),
        fetch("/api/market/onchain"),
        fetch("/api/market/news"),
      ])

      const result: MarketData = { marketData: null, historicalData: null, globalData: null }

      // Process market data
      if (marketResponse.status === "fulfilled" && marketResponse.value.ok) {
        const marketData = await marketResponse.value.json()
        result.marketData = marketData.marketData
        result.historicalData = marketData.historicalData
        result.globalData = marketData.globalData
      }

      // Process fear & greed index
      if (fearGreedResponse.status === "fulfilled" && fearGreedResponse.value.ok) {
        const fearGreedData = await fearGreedResponse.value.json()
        result.fearGreedIndex = fearGreedData.value
      }

      // Process on-chain data
      if (onChainResponse.status === "fulfilled" && onChainResponse.value.ok) {
        const onChainData = await onChainResponse.value.json()
        result.onChainData = onChainData
      }

      // Process news data
      if (newsResponse.status === "fulfilled" && newsResponse.value.ok) {
        const newsData = await newsResponse.value.json()
        result.newsData = newsData
      }

      setData(result)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching market data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [timeframe])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Advanced Market Data</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-600">Error loading market data: {error}</p>
          </div>
          <Button onClick={fetchData} className="gap-2">
            <RefreshCwIcon className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUpIcon className="h-8 w-8 text-orange-500" />
            Advanced Bitcoin Market
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive trading dashboard with on-chain metrics, sentiment analysis, and AI insights
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          {lastUpdated && (
            <Badge variant="outline" className="text-xs">
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
          <Button onClick={fetchData} size="sm" variant="outline" className="gap-2">
            <RefreshCwIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-xl font-bold">
                  {data?.marketData ? formatPrice(data.marketData.market_data.current_price.usd) : "Loading..."}
                </p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Fear & Greed</p>
                <p className="text-xl font-bold">
                  {data?.fearGreedIndex ? `${data.fearGreedIndex}/100` : "Loading..."}
                </p>
              </div>
              <AlertTriangleIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-xl font-bold">
                  {data?.marketData ? formatLargeNumber(data.marketData.market_data.total_volume.usd) : "Loading..."}
                </p>
              </div>
              <BarChart3Icon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold">
                  {data?.marketData ? formatLargeNumber(data.marketData.market_data.market_cap.usd) : "Loading..."}
                </p>
              </div>
              <ActivityIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="advanced-chart" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="advanced-chart">Advanced Chart</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
          <TabsTrigger value="onchain">On-Chain</TabsTrigger>
          <TabsTrigger value="institutional">Institutional</TabsTrigger>
          <TabsTrigger value="news">News & Events</TabsTrigger>
        </TabsList>

        <TabsContent value="advanced-chart" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <BrainIcon className="h-5 w-5" />
                      AI-Enhanced Price Chart
                    </CardTitle>
                    <div className="flex gap-2">
                      {["1", "7", "30", "90", "365"].map((days) => (
                        <Button
                          key={days}
                          size="sm"
                          variant={timeframe === days ? "default" : "outline"}
                          onClick={() => setTimeframe(days)}
                        >
                          {days === "1"
                            ? "1D"
                            : days === "7"
                              ? "7D"
                              : days === "30"
                                ? "30D"
                                : days === "90"
                                  ? "90D"
                                  : "1Y"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Chart Overlay Controls */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch id="news-overlay" checked={showNews} onCheckedChange={setShowNews} />
                      <Label htmlFor="news-overlay" className="text-sm">
                        News Events
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="whale-transactions"
                        checked={showWhaleTransactions}
                        onCheckedChange={setShowWhaleTransactions}
                      />
                      <Label htmlFor="whale-transactions" className="text-sm">
                        Whale Moves
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="liquidity-heatmap"
                        checked={showLiquidityHeatmap}
                        onCheckedChange={setShowLiquidityHeatmap}
                      />
                      <Label htmlFor="liquidity-heatmap" className="text-sm">
                        Liquidity Zones
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pattern-recognition"
                        checked={showPatternRecognition}
                        onCheckedChange={setShowPatternRecognition}
                      />
                      <Label htmlFor="pattern-recognition" className="text-sm">
                        AI Patterns
                      </Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <AdvancedChart
                    data={data}
                    timeframe={timeframe}
                    overlays={{
                      showNews,
                      showWhaleTransactions,
                      showLiquidityHeatmap,
                      showPatternRecognition,
                    }}
                    loading={loading}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-4">
              {/* Fear & Greed Gauge */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangleIcon className="h-5 w-5" />
                    Market Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SentimentGauge value={data?.fearGreedIndex || 50} loading={loading} />
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Market Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : data?.marketData ? (
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Market Cap</p>
                        <p className="text-lg font-semibold">
                          {formatLargeNumber(data.marketData.market_data.market_cap.usd)}
                        </p>
                        <p
                          className={`text-sm ${
                            data.marketData.market_data.market_cap_change_percentage_24h >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {data.marketData.market_data.market_cap_change_percentage_24h.toFixed(2)}% (24h)
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">24h Trading Volume</p>
                        <p className="text-lg font-semibold">
                          {formatLargeNumber(data.marketData.market_data.total_volume.usd)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">All-Time High</p>
                        <p className="text-lg font-semibold">{formatPrice(data.marketData.market_data.ath.usd)}</p>
                        <p className="text-sm text-red-600">
                          {data.marketData.market_data.ath_change_percentage.usd.toFixed(2)}% from ATH
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Circulating Supply</p>
                        <p className="text-lg font-semibold">
                          {data.marketData.market_data.circulating_supply.toLocaleString()} BTC
                        </p>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sentiment">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="h-5 w-5" />
                  Fear & Greed Index
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SentimentGauge value={data?.fearGreedIndex || 50} loading={loading} showDetails />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <NewsIcon className="h-5 w-5" />
                  News Sentiment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NewsOverlay data={data?.newsData} loading={loading} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="onchain">
          <OnChainMetrics data={data?.onChainData} loading={loading} />
        </TabsContent>

        <TabsContent value="institutional">
          <InstitutionalTracker data={data?.institutionalData} loading={loading} />
        </TabsContent>

        <TabsContent value="news">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NewsOverlay data={data?.newsData} loading={loading} expanded />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Market Events Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-orange-500 pl-4">
                      <p className="font-semibold">Bitcoin Halving</p>
                      <p className="text-sm text-muted-foreground">Next: April 2028</p>
                      <p className="text-xs text-muted-foreground">~1,200 days remaining</p>
                    </div>
                    <div className="border-l-2 border-blue-500 pl-4">
                      <p className="font-semibold">ETF Rebalancing</p>
                      <p className="text-sm text-muted-foreground">Monthly: End of month</p>
                      <p className="text-xs text-muted-foreground">Potential volume spike</p>
                    </div>
                    <div className="border-l-2 border-green-500 pl-4">
                      <p className="font-semibold">Options Expiry</p>
                      <p className="text-sm text-muted-foreground">Weekly: Every Friday</p>
                      <p className="text-xs text-muted-foreground">Increased volatility</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
