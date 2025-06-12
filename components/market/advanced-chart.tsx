"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { BarChart3, TrendingUp, Activity, Newspaper, BarChart, Layers, Wallet, Building } from "lucide-react"

interface AdvancedChartProps {
  data: any
  timeframe: string
  overlays: {
    showNews: boolean
    showWhaleTransactions: boolean
    showLiquidityHeatmap: boolean
    showPatternRecognition: boolean
  }
  loading: boolean
}

export default function AdvancedChart({ data, timeframe, overlays, loading }: AdvancedChartProps) {
  const [chartData, setChartData] = useState<any[]>([])
  const [chartLoading, setChartLoading] = useState(true)

  // Process historical data from CoinGecko API
  useEffect(() => {
    if (data?.historicalData?.prices) {
      const processedData = data.historicalData.prices.map((price: [number, number], index: number) => {
        const timestamp = price[0]
        const priceValue = price[1]
        const volume = data.historicalData.total_volumes[index]?.[1] || 0
        const marketCap = data.historicalData.market_caps[index]?.[1] || 0

        return {
          date: new Date(timestamp).toLocaleDateString(),
          timestamp: timestamp,
          price: Math.round(priceValue * 100) / 100, // Round to 2 decimal places
          volume: Math.round(volume / 1000000), // Convert to millions
          marketCap: Math.round(marketCap / 1000000000), // Convert to billions
          news: Math.random() > 0.8 ? 1 : 0, // Mock news events
        }
      })

      setChartData(processedData)
      setChartLoading(false)
    } else if (!loading) {
      // Fallback to mock data if API data is not available
      const mockData = [
        { date: "2023-01-01", price: 16500, volume: 12000, news: 0 },
        { date: "2023-02-01", price: 19800, volume: 18000, news: 1 },
        { date: "2023-03-01", price: 22300, volume: 15000, news: 0 },
        { date: "2023-04-01", price: 28100, volume: 22000, news: 1 },
        { date: "2023-05-01", price: 27400, volume: 19000, news: 0 },
        { date: "2023-06-01", price: 30100, volume: 25000, news: 1 },
        { date: "2023-07-01", price: 29200, volume: 20000, news: 0 },
        { date: "2023-08-01", price: 26000, volume: 17000, news: 0 },
        { date: "2023-09-01", price: 27800, volume: 19000, news: 1 },
        { date: "2023-10-01", price: 34500, volume: 28000, news: 1 },
        { date: "2023-11-01", price: 37800, volume: 32000, news: 0 },
        { date: "2023-12-01", price: 42000, volume: 38000, news: 1 },
        { date: "2024-01-01", price: 45000, volume: 42000, news: 0 },
        { date: "2024-02-01", price: 51000, volume: 48000, news: 1 },
        { date: "2024-03-01", price: 68000, volume: 65000, news: 1 },
        { date: "2024-04-01", price: 64000, volume: 55000, news: 0 },
        { date: "2024-05-01", price: 70000, volume: 62000, news: 1 },
      ]
      setChartData(mockData)
      setChartLoading(false)
    }
  }, [data, loading])

  const [overlayStates, setOverlayStates] = useState({
    news: true,
    whales: true,
    liquidity: false,
    patterns: true,
    institutional: false,
  })

  const toggleOverlay = (key: keyof typeof overlayStates) => {
    setOverlayStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  // Format volume for display
  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}B`
    }
    return `${volume}M`
  }

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-orange-600">Price: {formatPrice(payload[0]?.value || 0)}</p>
          <p className="text-blue-600">Volume: {formatVolume(payload[1]?.value || 0)}</p>
        </div>
      )
    }
    return null
  }

  if (loading || chartLoading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Bitcoin Price Chart</CardTitle>
          <CardDescription>Loading real-time market data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Bitcoin Price Chart</CardTitle>
            <CardDescription>Real-time market data from CoinGecko API</CardDescription>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="news-overlay" checked={overlayStates.news} onCheckedChange={() => toggleOverlay("news")} />
              <Label htmlFor="news-overlay">News Sentiment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="whales-overlay"
                checked={overlayStates.whales}
                onCheckedChange={() => toggleOverlay("whales")}
              />
              <Label htmlFor="whales-overlay">
                <span>Whale Transactions ({">"}1000 BTC)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="liquidity-overlay"
                checked={overlayStates.liquidity}
                onCheckedChange={() => toggleOverlay("liquidity")}
              />
              <Label htmlFor="liquidity-overlay">Liquidity Heatmap</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="patterns-overlay"
                checked={overlayStates.patterns}
                onCheckedChange={() => toggleOverlay("patterns")}
              />
              <Label htmlFor="patterns-overlay">AI Pattern Detection</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="institutional-overlay"
                checked={overlayStates.institutional}
                onCheckedChange={() => toggleOverlay("institutional")}
              />
              <Label htmlFor="institutional-overlay">Institutional Flows</Label>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList>
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Chart</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Sentiment</span>
            </TabsTrigger>
            <TabsTrigger value="onchain" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              <span>On-Chain</span>
            </TabsTrigger>
            <TabsTrigger value="institutional" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Institutional</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              <span>News</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  price: {
                    label: "BTC Price",
                    color: "hsl(var(--chart-1))",
                  },
                  volume: {
                    label: "Volume (M)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                    <YAxis yAxisId="price" orientation="left" tick={{ fontSize: 12 }} tickFormatter={formatPrice} />
                    <YAxis yAxisId="volume" orientation="right" tick={{ fontSize: 12 }} tickFormatter={formatVolume} />
                    <ChartTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      yAxisId="price"
                      type="monotone"
                      dataKey="price"
                      stroke="var(--color-price)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      yAxisId="volume"
                      type="monotone"
                      dataKey="volume"
                      stroke="var(--color-volume)"
                      strokeWidth={1}
                      dot={false}
                      opacity={0.6}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-lg font-bold">
                      {data?.marketData ? formatPrice(data.marketData.market_data.current_price.usd) : "Loading..."}
                    </span>
                  </div>
                  <div
                    className={`text-sm ${
                      data?.marketData?.market_data?.price_change_percentage_24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {data?.marketData
                      ? `${data.marketData.market_data.price_change_percentage_24h.toFixed(2)}% (24h)`
                      : "Loading..."}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-blue-500" />
                    <span className="text-lg font-bold">
                      {data?.marketData
                        ? `$${(data.marketData.market_data.total_volume.usd / 1e9).toFixed(2)}B`
                        : "Loading..."}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Trading volume</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-green-500" />
                    <span className="text-lg font-bold">
                      {data?.marketData
                        ? `$${(data.marketData.market_data.market_cap.usd / 1e12).toFixed(2)}T`
                        : "Loading..."}
                    </span>
                  </div>
                  <div
                    className={`text-sm ${
                      data?.marketData?.market_data?.market_cap_change_percentage_24h >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {data?.marketData
                      ? `${data.marketData.market_data.market_cap_change_percentage_24h.toFixed(2)}% (24h)`
                      : "Loading..."}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sentiment">
            <div className="h-[500px] flex items-center justify-center border rounded-md">
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Sentiment Analysis</h3>
                <p className="text-sm text-muted-foreground mt-2">Fear & Greed Index and social sentiment metrics</p>
                <Button className="mt-4">Load Sentiment Data</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="onchain">
            <div className="h-[500px] flex items-center justify-center border rounded-md">
              <div className="text-center">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">On-Chain Metrics</h3>
                <p className="text-sm text-muted-foreground mt-2">Network health and blockchain analytics</p>
                <Button className="mt-4">Load On-Chain Data</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="institutional">
            <div className="h-[500px] flex items-center justify-center border rounded-md">
              <div className="text-center">
                <Building className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Institutional Activity</h3>
                <p className="text-sm text-muted-foreground mt-2">ETF flows, CME futures, and corporate holdings</p>
                <Button className="mt-4">Load Institutional Data</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="news">
            <div className="h-[500px] flex items-center justify-center border rounded-md">
              <div className="text-center">
                <Newspaper className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">News & Events</h3>
                <p className="text-sm text-muted-foreground mt-2">Market-moving news with sentiment analysis</p>
                <Button className="mt-4">Load News Feed</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
