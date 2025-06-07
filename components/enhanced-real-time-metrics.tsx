"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react"
import { BitcoinPriceCard } from "./bitcoin-price-card"
import { useBitcoinPrice } from "@/hooks/use-bitcoin-price"

interface Metric {
  label: string
  value: string
  change: number
  icon: React.ReactNode
}

export function EnhancedRealTimeMetrics() {
  const { price: btcPrice, change24h } = useBitcoinPrice()
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      label: "24h Volume",
      value: "125,432 BTC",
      change: -1.2,
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: "Active Addresses",
      value: "1,234,567",
      change: 5.7,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Network Hash Rate",
      value: "450.2 EH/s",
      change: 0.8,
      icon: <Zap className="h-4 w-4" />,
    },
  ])

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics")
        const data = await response.json()

        const updatedMetrics = [
          {
            label: "24h Volume",
            value: "125,432 BTC",
            change: Math.random() * 5 - 2.5,
            icon: <Activity className="h-4 w-4" />,
          },
          {
            label: "Active Addresses",
            value: Number(data.currentMetrics?.activeAddresses || 1234567).toLocaleString(),
            change: Math.random() * 10 - 5,
            icon: <TrendingUp className="h-4 w-4" />,
          },
          {
            label: "Network Hash Rate",
            value: `${Number(data.currentMetrics?.hashRate || 450.2).toFixed(1)} EH/s`,
            change: Math.random() * 2 - 1,
            icon: <Zap className="h-4 w-4" />,
          },
        ]

        setMetrics(updatedMetrics)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* Bitcoin Price Ticker - Full Width */}
      <BitcoinPriceCard />

      {/* Other Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                {metric.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <Badge variant={metric.change > 0 ? "default" : "destructive"} className="text-xs">
                  {metric.change > 0 ? "+" : ""}
                  {metric.change.toFixed(1)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
