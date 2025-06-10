"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, TrendingUpIcon } from "lucide-react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

interface MarketData {
  marketData: any
  historicalData: any
  globalData: any
}

export default function MarketPage() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState("30")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/market/bitcoin?days=${timeframe}`)

      if (!response.ok) {
        throw new Error("Failed to fetch market data")
      }

      const result = await response.json()
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

  const getChartData = () => {
    if (!data?.historicalData?.prices) return null

    const prices = data.historicalData.prices.map((price: [number, number]) => ({
      x: new Date(price[0]),
      y: price[1],
    }))

    return {
      datasets: [
        {
          label: "Bitcoin Price",
          data: prices,
          borderColor: "rgb(249, 115, 22)",
          backgroundColor: "rgba(249, 115, 22, 0.1)",
          tension: 0.4,
          pointRadius: 0,
          fill: true,
        },
      ],
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => formatPrice(context.parsed.y),
          title: (context: any) => {
            const date = new Date(context[0].parsed.x)
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          },
        },
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: timeframe === "1" ? "hour" : "day",
        },
        grid: { display: false },
      },
      y: {
        position: "right" as const,
        ticks: {
          callback: (value: any) => formatPrice(value),
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Market Data</h1>
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
            Bitcoin Market Data
          </h1>
          <p className="text-muted-foreground mt-1">Real-time market data powered by CoinGecko</p>
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

      {/* Global Stats */}
      {data?.globalData && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">BTC Dominance</p>
                <p className="text-2xl font-bold">{data.globalData.data.market_cap_percentage.btc.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total Market Cap</p>
                <p className="text-2xl font-bold">{formatLargeNumber(data.globalData.data.total_market_cap.usd)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold">{formatLargeNumber(data.globalData.data.total_volume.usd)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price Card */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardContent className="pt-6">
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ) : data?.marketData ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex items-center gap-4">
                    <img src={data.marketData.image.large || "/placeholder.svg"} alt="Bitcoin" className="w-16 h-16" />
                    <div>
                      <h2 className="text-2xl font-bold">Bitcoin (BTC)</h2>
                      <p className="text-sm text-muted-foreground">
                        Last updated: {new Date(data.marketData.last_updated).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 text-right">
                    <div className="text-3xl font-bold">
                      {formatPrice(data.marketData.market_data.current_price.usd)}
                    </div>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 ${
                        data.marketData.market_data.price_change_24h >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {data.marketData.market_data.price_change_24h >= 0 ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                      <span>
                        {formatPrice(Math.abs(data.marketData.market_data.price_change_24h))} (
                        {data.marketData.market_data.price_change_percentage_24h.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Chart */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Price History</CardTitle>
                <div className="flex gap-2">
                  {["1", "7", "30", "90", "365"].map((days) => (
                    <Button
                      key={days}
                      size="sm"
                      variant={timeframe === days ? "default" : "outline"}
                      onClick={() => setTimeframe(days)}
                    >
                      {days === "1" ? "1D" : days === "7" ? "7D" : days === "30" ? "30D" : days === "90" ? "90D" : "1Y"}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-80 w-full" />
              ) : getChartData() ? (
                <div className="h-80">
                  <Line data={getChartData()!} options={chartOptions} />
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No chart data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Market Stats */}
        <div>
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
                    <p className="text-sm text-muted-foreground">All-Time Low</p>
                    <p className="text-lg font-semibold">{formatPrice(data.marketData.market_data.atl.usd)}</p>
                    <p className="text-sm text-green-600">
                      {data.marketData.market_data.atl_change_percentage.usd.toFixed(2)}% from ATL
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Circulating Supply</p>
                    <p className="text-lg font-semibold">
                      {data.marketData.market_data.circulating_supply.toLocaleString()} BTC
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Max Supply</p>
                    <p className="text-lg font-semibold">
                      {data.marketData.market_data.max_supply?.toLocaleString() || "21,000,000"} BTC
                    </p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
