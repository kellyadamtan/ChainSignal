"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, RefreshCw, Info, CheckCircle, Shield, AlertTriangle, Zap } from "lucide-react"
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface PriceData {
  price: number
  change24h: number
  volume24h: number
  timestamp: number
  marketCap: number
  supply: number
  maxSupply: number
  rank: number
  symbol: string
  name: string
  assetId?: string
  _source: string
  _error?: string
  _timestamp?: string
}

export function BitcoinPriceCard() {
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [animationClass, setAnimationClass] = useState("")

  const fetchPriceData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/bitcoin-price/current")
      const data = await response.json()

      if (response.ok) {
        setPriceData(data)
        setLastUpdate(new Date())

        // Trigger animation for price changes
        if (priceData && data.price !== priceData.price) {
          const trend = data.price > priceData.price ? "up" : "down"
          setAnimationClass(trend === "up" ? "animate-pulse text-green-600" : "animate-pulse text-red-600")
          setTimeout(() => setAnimationClass(""), 1000)
        }

        // Clear error if we have data
        if (data._error) {
          console.warn("API returned data with error:", data._error)
        }
      } else {
        setError(data.error || "Failed to fetch price data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPriceData()

    // Set up polling interval
    const interval = setInterval(fetchPriceData, 30000) // Every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    return `$${num.toLocaleString()}`
  }

  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)}%`
  }

  const getTrendIcon = () => {
    if (!priceData) return <Minus className="h-4 w-4 text-gray-500" />
    if (priceData.change24h > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (priceData.change24h < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600 bg-green-50 border-green-200"
    if (change < 0) return "text-red-600 bg-red-50 border-red-200"
    return "text-gray-600 bg-gray-50 border-gray-200"
  }

  const getSourceBadge = () => {
    if (!priceData) return null

    const sourceConfig = {
      coingecko: {
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        text: "CoinGecko",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      coindesk: {
        icon: <Shield className="h-3 w-3 mr-1" />,
        text: "CoinDesk",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      coinbase: {
        icon: <Zap className="h-3 w-3 mr-1" />,
        text: "Coinbase",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      binance: {
        icon: <Zap className="h-3 w-3 mr-1" />,
        text: "Binance",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      emergency_fallback: {
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        text: "Emergency",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    }

    const config = sourceConfig[priceData._source as keyof typeof sourceConfig] || {
      icon: <Info className="h-3 w-3 mr-1" />,
      text: priceData._source,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    }

    return (
      <Badge variant="outline" className={config.className}>
        {config.icon}
        {config.text}
      </Badge>
    )
  }

  if (error && !priceData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="text-red-600">Error: {error}</div>
            <Button onClick={fetchPriceData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center space-x-2">
              <span>Bitcoin Price</span>
              {priceData && (
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 text-xs">
                      <div>Rank: #{priceData.rank}</div>
                      <div>Symbol: {priceData.symbol}</div>
                      <div>Asset ID: {priceData.assetId || "BTC"}</div>
                      <div>Supply: {Number(priceData.supply).toLocaleString()} BTC</div>
                      <div>Max Supply: {Number(priceData.maxSupply).toLocaleString()} BTC</div>
                      <div>Data Source: {priceData._source}</div>
                      {priceData._timestamp && (
                        <div>API Time: {new Date(priceData._timestamp).toLocaleTimeString()}</div>
                      )}
                      {priceData._error && <div className="text-yellow-600">Warning: {priceData._error}</div>}
                    </div>
                  </TooltipContent>
                </UITooltip>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {getSourceBadge()}
              <Button variant="outline" size="sm" onClick={fetchPriceData} disabled={isLoading} className="h-7 px-2">
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
                {priceData ? formatPrice(priceData.price) : "Loading..."}
              </div>
              {lastUpdate && (
                <div className="text-xs text-muted-foreground">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                  {priceData?._source && ` via ${priceData._source}`}
                </div>
              )}
            </div>

            {priceData && (
              <div className="flex items-center space-x-3">
                {getTrendIcon()}
                <Badge className={`px-3 py-1 font-medium border ${getChangeColor(priceData.change24h)}`}>
                  {formatChange(priceData.change24h)}
                </Badge>
              </div>
            )}
          </div>

          {/* Market Stats */}
          {priceData && (
            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Market Cap</div>
                <div className="text-sm font-semibold">
                  {priceData.marketCap > 0 ? formatLargeNumber(priceData.marketCap) : "N/A"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">24h Volume</div>
                <div className="text-sm font-semibold">
                  {priceData.volume24h > 0 ? formatLargeNumber(priceData.volume24h) : "N/A"}
                </div>
              </div>
            </div>
          )}

          {/* Error Warning */}
          {priceData?._error && (
            <div className="pt-2 border-t">
              <div className="flex items-center space-x-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                <AlertTriangle className="h-3 w-3" />
                <span>Using backup data: {priceData._error}</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !priceData && (
            <div className="h-24 w-full flex items-center justify-center bg-muted/20 rounded-md">
              <div className="text-sm text-muted-foreground flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Loading Bitcoin price data...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
