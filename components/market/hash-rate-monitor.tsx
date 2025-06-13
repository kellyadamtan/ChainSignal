"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, RefreshCw } from "lucide-react"

interface HashRateData {
  hashRate: number
  difficulty: number
  blockHeight: number
  blockTime: number
  timestamp: string
}

interface HistoricalHashRateData {
  date: string
  hashRate: number
}

interface MiningPoolData {
  pool: string
  hashrate: number
  blocks: number
}

export function HashRateMonitor() {
  const [currentHashRate, setCurrentHashRate] = useState<HashRateData | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalHashRateData[]>([])
  const [poolData, setPoolData] = useState<MiningPoolData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchHashRateData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch current hash rate
      const currentResponse = await fetch("/api/hashrate?type=current")
      const currentData = await currentResponse.json()

      if (!currentResponse.ok) {
        throw new Error(currentData.error || "Failed to fetch current hash rate")
      }

      setCurrentHashRate(currentData)

      // Fetch historical data
      const historicalResponse = await fetch("/api/hashrate?type=historical&days=30")
      const historicalData = await historicalResponse.json()

      if (!historicalResponse.ok) {
        throw new Error(historicalData.error || "Failed to fetch historical hash rate")
      }

      setHistoricalData(historicalData.data)

      // Fetch mining pool data
      const poolsResponse = await fetch("/api/hashrate?type=pools&days=7")
      const poolsData = await poolsResponse.json()

      if (!poolsResponse.ok) {
        throw new Error(poolsData.error || "Failed to fetch mining pool data")
      }

      setPoolData(poolsData.pools)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching hash rate data:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHashRateData()

    // Refresh data every 5 minutes
    const interval = setInterval(fetchHashRateData, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const formatHashRate = (hashRate: number) => {
    return `${hashRate.toLocaleString()} TH/s`
  }

  const formatDifficulty = (difficulty: number) => {
    if (difficulty >= 1e12) {
      return `${(difficulty / 1e12).toFixed(2)} T`
    }
    if (difficulty >= 1e9) {
      return `${(difficulty / 1e9).toFixed(2)} G`
    }
    return difficulty.toLocaleString()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString()
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bitcoin Hash Rate Monitor</CardTitle>
          <CardDescription>Network hash rate and mining distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 text-red-500">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span>Error: {error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bitcoin Hash Rate Monitor</CardTitle>
            <CardDescription>Network hash rate and mining distribution</CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center">
            <Info className="mr-1 h-3 w-3" />
            Powered by Bitquery
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="historical">Historical</TabsTrigger>
            <TabsTrigger value="pools">Mining Pools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {isLoading || !currentHashRate ? (
              <div className="space-y-3">
                <Skeleton className="h-[60px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Current Hash Rate</div>
                    <div className="text-2xl font-bold">{formatHashRate(currentHashRate.hashRate)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Network Difficulty</div>
                    <div className="text-2xl font-bold">{formatDifficulty(currentHashRate.difficulty)}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Latest Block</div>
                    <div className="text-xl font-medium">{currentHashRate.blockHeight.toLocaleString()}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Average Block Time</div>
                    <div className="text-xl font-medium">{currentHashRate.blockTime.toFixed(1)} seconds</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-medium mb-2">7-Day Hash Rate Trend</div>
                  {historicalData.length > 0 ? (
                    <ChartContainer
                      config={{
                        hashRate: {
                          label: "Hash Rate (TH/s)",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[200px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={historicalData.slice(0, 7).reverse()}
                          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                          <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="hashRate"
                            stroke="var(--color-hashRate)"
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <Skeleton className="h-[200px] w-full" />
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="historical">
            {isLoading || historicalData.length === 0 ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="space-y-4">
                <div className="text-sm font-medium">30-Day Hash Rate History</div>
                <ChartContainer
                  config={{
                    hashRate: {
                      label: "Hash Rate (TH/s)",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData.reverse()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="hashRate"
                        stroke="var(--color-hashRate)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">30-Day High</div>
                    <div className="text-sm font-medium">
                      {formatHashRate(Math.max(...historicalData.map((d) => d.hashRate)))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">30-Day Low</div>
                    <div className="text-sm font-medium">
                      {formatHashRate(Math.min(...historicalData.map((d) => d.hashRate)))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">30-Day Average</div>
                    <div className="text-sm font-medium">
                      {formatHashRate(historicalData.reduce((sum, d) => sum + d.hashRate, 0) / historicalData.length)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pools">
            {isLoading || poolData.length === 0 ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="space-y-4">
                <div className="text-sm font-medium">Mining Pool Distribution (7-Day)</div>
                <div className="space-y-3">
                  {poolData.map((pool, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: `hsl(${index * 25}, 70%, 50%)` }}
                        />
                        <span className="font-medium">{pool.pool}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-muted-foreground w-20 text-right">{pool.hashrate.toFixed(1)}%</div>
                        <div className="text-sm text-muted-foreground w-20 text-right">{pool.blocks} blocks</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative pt-4 mt-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-2 text-xs text-muted-foreground">Data from last 7 days</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground mt-2">
                  <p>
                    Mining pool distribution is calculated based on blocks mined in the last 7 days. Hash rate
                    percentage is estimated from the proportion of blocks mined by each pool.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {!isLoading && (
          <div className="flex items-center justify-end mt-4 text-xs text-muted-foreground">
            <RefreshCw className="h-3 w-3 mr-1" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
