"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ActivityIcon, ZapIcon, UsersIcon, TrendingUpIcon } from "lucide-react"

interface OnChainMetricsProps {
  data: any
  loading: boolean
}

export default function OnChainMetrics({ data, loading }: OnChainMetricsProps) {
  // Mock data for demonstration
  const mockData = {
    hashRate: { current: 450000000, change24h: 2.3 },
    difficulty: { current: 62000000000000, nextAdjustment: -1.2, blocksUntilAdjustment: 1250 },
    mempool: { size: 45000, fees: { fast: 25, medium: 15, slow: 8 } },
    addresses: { active: 950000, new: 125000 },
    whaleTransactions: [
      { hash: "abc123...", amount: 1250.5, from: "exchange", to: "unknown", timestamp: Date.now() - 3600000 },
      { hash: "def456...", amount: 2100.0, from: "whale", to: "exchange", timestamp: Date.now() - 7200000 },
    ],
  }

  const onChainData = data || mockData

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
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
              <p className="text-2xl font-bold">
                {(onChainData.hashRate.current / 1000000).toFixed(0)} EH/s
              </p>
              <div className="flex items-center gap-2">
                <Badge variant={onChainData.hashRate.change24h > 0 ? "default" : "destructive"}>
                  {onChainData.hashRate.change24h > 0 ? "+" : ""}{onChainData.hashRate.change24h}%
                </Badge>
                <span className="text-xs text-muted-foreground">24h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ActivityIcon className="h-4 w-4" />
              Difficulty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {(onChainData.difficulty.current / 1000000000000).toFixed(1)}T
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Next: {onChainData.difficulty.nextAdjustment}%
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {onChainData.difficulty.blocksUntilAdjustment} blocks remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <UsersIcon className="h-4 w-4" />
              Active Addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {(onChainData.addresses.active / 1000).toFixed(0)}K
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  +{(onChainData.addresses.new / 1000).toFixed(0)}K new
                </Badge>
                <span className="text-xs text-muted-foreground">24h</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUpIcon className="h-4 w-4" />
              Mempool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">
                {(onChainData.mempool.size / 1000).toFixed(0)}K
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Fast: {onChainData.mempool.fees.fast} sat/vB</span>
                  <span>Slow: {onChainData.mempool.fees.slow} sat/vB</span>
                </div>
                <Progress value={(onChainData.mempool.size / 100000) * 100} className="h-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Whale Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🐋 Large Transactions (>1000 BTC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {onChainData.whaleTransactions.map((tx: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-semibold">{tx.amount.toLocaleString()} BTC</p>
                  <p className="text-sm text-muted-foreground">
                    {tx.from} → {tx.to}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{tx.hash}</Badge>
                </div>
              </div>
            )})}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
