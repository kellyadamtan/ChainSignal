"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import {
  BarChart3,
  TrendingUp,
  Activity,
  Newspaper,
  BarChart,
  Layers,
  Wallet,
  Building,
  AlertCircle,
} from "lucide-react"

// Mock data
const priceData = [
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

export default function AdvancedChart() {
  const [overlays, setOverlays] = useState({
    news: true,
    whales: true,
    liquidity: false,
    patterns: true,
    institutional: false,
  })

  const toggleOverlay = (key: keyof typeof overlays) => {
    setOverlays((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>Bitcoin Price Chart</CardTitle>
            <CardDescription>Advanced market analysis with on-chain metrics</CardDescription>
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="news-overlay" checked={overlays.news} onCheckedChange={() => toggleOverlay("news")} />
              <Label htmlFor="news-overlay">News Sentiment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="whales-overlay" checked={overlays.whales} onCheckedChange={() => toggleOverlay("whales")} />
              <Label htmlFor="whales-overlay">
                <span>Whale Transactions ({">"}1000 BTC)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="liquidity-overlay"
                checked={overlays.liquidity}
                onCheckedChange={() => toggleOverlay("liquidity")}
              />
              <Label htmlFor="liquidity-overlay">Liquidity Heatmap</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="patterns-overlay"
                checked={overlays.patterns}
                onCheckedChange={() => toggleOverlay("patterns")}
              />
              <Label htmlFor="patterns-overlay">AI Pattern Detection</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="institutional-overlay"
                checked={overlays.institutional}
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
                    label: "Volume",
                    color: "hsl(var(--chart-2))",
                  },
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="var(--color-price)" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="volume" stroke="var(--color-volume)" />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Pattern Detection</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center gap-2 text-green-500">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Bull Flag Detected (4H)</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-500 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Resistance at $71,200</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Whale Activity</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">3 large transactions in 24h</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Total volume: 5,280 BTC</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Market Sentiment</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Greed (76/100)</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Up 8 points from yesterday</div>
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
