"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUpIcon, TrendingDownIcon, ActivityIcon, ZapIcon } from "lucide-react"

interface OnChainMetricsProps {
  data?: any
  loading?: boolean
}

export default function OnChainMetrics({ data, loading }: OnChainMetricsProps) {
  // Mock data for demonstration
  const mockData = {
    hashRate: {
      current: 450.5,
      change24h: 2.3,
      unit: "EH/s",
    },
    difficulty: {
      current: 62.46,
      nextAdjustment: -1.2,
      blocksUntilAdjustment: 1247,
      unit: "T",
    },
    mempool: {
      size: 125.3,
      fees: {
        low: 12,
        medium: 18,
        high: 25,
      },
      congestion: 65,
    },
    addresses: {
      active: 1.2,
      new: 45.6,
      change24h: 3.4,
      unit: "M",
    },
    whaleTransactions: [
      {
        amount: 1250,
        type: "exchange_inflow",
        timestamp: "2 hours ago",
        exchange: "Binance",
      },
      {
        amount: 890,
        type: "cold_storage",
        timestamp: "4 hours ago",
        exchange: "Unknown",
      },
      {
        amount: 2100,
        type: "exchange_outflow",
        timestamp: "6 hours ago",
        exchange: "Coinbase",
      },
    ],
  }

  const onChainData = data || mockData

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Network Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ZapIcon className="h-4 w-4" />
              Hash Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{onChainData.hashRate.current}</span>
                <span className="text-sm text-muted-foreground">{onChainData.hashRate.unit}</span>
              </div>
              <div className="flex items-center gap-1">
                {onChainData.hashRate.change24h > 0 ? (
                  <TrendingUpIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDownIcon className="h-3 w-3 text-red-500" />
                )}
                <span className={`text-xs ${onChainData.hashRate.change24h > 0 ? "text-green-600" : "text-red-600"}`}>
                  {onChainData.hashRate.change24h > 0 ? "+" : ""}
                  {onChainData.hashRate.change24h}% (24h)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ActivityIcon className="h-4 w-4" />
              Mining Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{onChainData.difficulty.current}</span>
                <span className="text-sm text-muted-foreground">{onChainData.difficulty.unit}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Next adjustment: {onChainData.difficulty.nextAdjustment}%
              </div>
              <div className="text-xs text-muted-foreground">
                {onChainData.difficulty.blocksUntilAdjustment} blocks remaining
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ActivityIcon className="h-4 w-4" />
              Active Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">{onChainData.addresses.active}</span>
                <span className="text-sm text-muted-foreground">{onChainData.addresses.unit}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUpIcon className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+{onChainData.addresses.change24h}% (24h)</span>
              </div>
              <div className="text-xs text-muted-foreground">New: {onChainData.addresses.new}K addresses</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ActivityIcon className="h-4 w-4" />
              Mempool Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Congestion</span>
                  <span>{onChainData.mempool.congestion}%</span>
                </div>
                <Progress value={onChainData.mempool.congestion} className="h-2" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="font-medium">{onChainData.mempool.fees.low}</div>
                  <div className="text-muted-foreground">Low</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{onChainData.mempool.fees.medium}</div>
                  <div className="text-muted-foreground">Med</div>
                </div>
                <div className="text-center">
                  <div className="font-medium">{onChainData.mempool.fees.high}</div>
                  <div className="text-muted-foreground">High</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Whale Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5" />
            Large Transactions (>1000 BTC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onChainData.whaleTransactions.map((tx: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      tx.type === "exchange_inflow"
                        ? "bg-red-500"
                        : tx.type === "exchange_outflow"
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }`}
                  />
                  <div>
                    <div className="font-semibold">{tx.amount.toLocaleString()} BTC</div>
                    <div className="text-sm text-muted-foreground">
                      {tx.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      {tx.exchange !== "Unknown" && ` • ${tx.exchange}`}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {tx.timestamp}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
