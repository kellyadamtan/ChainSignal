"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BuildingIcon, TrendingUpIcon, DollarSignIcon, BarChart3Icon } from "lucide-react"

interface InstitutionalTrackerProps {
  data: any
  loading: boolean
}

export default function InstitutionalTracker({ data, loading }: InstitutionalTrackerProps) {
  // Mock institutional data
  const mockData = {
    etfFlows: {
      daily: 245000000, // $245M
      weekly: 1200000000, // $1.2B
      total: 45000000000, // $45B
    },
    cmeOpenInterest: {
      current: 15000, // contracts
      change24h: 5.2,
    },
    grayscalePremium: -2.5, // -2.5% discount
    institutionalHoldings: [
      { name: "MicroStrategy", btc: 174530, value: 7500000000 },
      { name: "Tesla", btc: 9720, value: 418000000 },
      { name: "Block Inc", btc: 8027, value: 345000000 },
      { name: "Marathon Digital", btc: 15174, value: 652000000 },
    ],
  }

  const institutionalData = data || mockData

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ETF & Institutional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSignIcon className="h-4 w-4" />
              ETF Flows (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">${(institutionalData.etfFlows.daily / 1000000).toFixed(0)}M</p>
              <div className="space-y-1">
                <Badge variant={institutionalData.etfFlows.daily > 0 ? "default" : "destructive"}>
                  {institutionalData.etfFlows.daily > 0 ? "Inflow" : "Outflow"}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Total AUM: ${(institutionalData.etfFlows.total / 1000000000).toFixed(0)}B
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3Icon className="h-4 w-4" />
              CME Open Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{institutionalData.cmeOpenInterest.current.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <Badge variant={institutionalData.cmeOpenInterest.change24h > 0 ? "default" : "destructive"}>
                  {institutionalData.cmeOpenInterest.change24h > 0 ? "+" : ""}
                  {institutionalData.cmeOpenInterest.change24h}%
                </Badge>
                <span className="text-xs text-muted-foreground">contracts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUpIcon className="h-4 w-4" />
              GBTC Premium
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold">{institutionalData.grayscalePremium}%</p>
              <Badge variant={institutionalData.grayscalePremium > 0 ? "default" : "secondary"}>
                {institutionalData.grayscalePremium > 0 ? "Premium" : "Discount"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Corporate Holdings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            Corporate Bitcoin Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {institutionalData.institutionalHoldings.map((holding: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-semibold">{holding.name}</p>
                  <p className="text-sm text-muted-foreground">{holding.btc.toLocaleString()} BTC</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${(holding.value / 1000000000).toFixed(2)}B</p>
                  <p className="text-xs text-muted-foreground">
                    ~{((holding.btc / 21000000) * 100).toFixed(3)}% of supply
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
