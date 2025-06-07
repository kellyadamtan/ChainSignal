"use client"

import { useBitcoinPrice } from "@/hooks/use-bitcoin-price"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Wifi, WifiOff, RefreshCw } from "lucide-react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function BitcoinPriceTicker() {
  const { price, change24h, isConnected, priceHistory, lastUpdate, trend } = useBitcoinPrice()
  const [animationClass, setAnimationClass] = useState("")
  const [fallbackPrice, setFallbackPrice] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dataSource, setDataSource] = useState<string>("live")

  // Fetch fallback price if service is not connected
  useEffect(() => {
    if (!isConnected && !price && !isLoading) {
      setIsLoading(true)

      // Try the mock endpoint which should always work
      fetch("/api/bitcoin-price/mock")
        .then((res) => res.json())
        .then((data) => {
          if (data.price) {
            setFallbackPrice(data.price)
            setDataSource("mock")
          }
        })
        .catch((err) => console.error("Failed to fetch fallback price:", err))
        .finally(() => setIsLoading(false))
    }
  }, [isConnected, price, isLoading])

  // Animate price changes
  useEffect(() => {
    if (trend !== "neutral") {
      setAnimationClass(trend === "up" ? "animate-pulse text-green-600" : "animate-pulse text-red-600")
      const timer = setTimeout(() => setAnimationClass(""), 1000)
      return () => clearTimeout(timer)
    }
  }, [trend])

  const displayPrice = price || fallbackPrice

  const formatPrice = (price: number | null) => {
    if (price === null) return "Loading..."
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 bg-green-50 border-green-200"
    if (change < 0) return "text-red-600 bg-red-50 border-red-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }

  // Manual refresh function
  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/bitcoin-price/current")
      const data = await response.json()
      if (data.price) {
        setFallbackPrice(data.price)
        setDataSource(data._source || "api")
      }
    } catch (error) {
      console.error("Manual refresh failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Prepare chart data
  const chartData = priceHistory.slice(-60).map((data, index) => ({
    time: new Date(data.timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: data.price,
    index,
  }))

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Bitcoin Price</CardTitle>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant={isLoading ? "outline" : "secondary"} className={isLoading ? "animate-pulse" : ""}>
                {isLoading ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {isLoading ? "Updating..." : dataSource === "mock" ? "Mock Data" : "Offline"}
              </Badge>
            )}

            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="h-7 px-2">
              <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Display */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className={`text-3xl font-bold transition-colors duration-300 ${animationClass}`}>
              {formatPrice(displayPrice)}
            </div>
            {lastUpdate && (
              <div className="text-xs text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString()}
                {dataSource !== "live" && ` (${dataSource})`}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {getTrendIcon()}
            <Badge className={`px-3 py-1 font-medium border ${getChangeColor(change24h)}`}>
              {formatChange(change24h)}
            </Badge>
          </div>
        </div>

        {/* Mini Chart */}
        {chartData.length > 1 ? (
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="time" hide />
                <YAxis domain={["dataMin - 100", "dataMax + 100"]} hide />
                <Tooltip
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: number) => [formatPrice(value), "Price"]}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={change24h >= 0 ? "#10b981" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: change24h >= 0 ? "#10b981" : "#ef4444" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-24 w-full flex items-center justify-center bg-muted/20 rounded-md">
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Loading price data..." : "No price history available"}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">24h High</div>
            <div className="text-sm font-semibold">
              {priceHistory.length > 0 ? formatPrice(Math.max(...priceHistory.map((p) => p.price))) : "--"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">24h Low</div>
            <div className="text-sm font-semibold">
              {priceHistory.length > 0 ? formatPrice(Math.min(...priceHistory.map((p) => p.price))) : "--"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Data Points</div>
            <div className="text-sm font-semibold">{priceHistory.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
