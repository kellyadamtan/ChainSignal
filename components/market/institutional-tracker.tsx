"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUpIcon, TrendingDownIcon, BuildingIcon, DollarSignIcon } from "lucide-react"

interface InstitutionalTrackerProps {
  data?: any
  loading?: boolean
}

export default function InstitutionalTracker({ data, loading }: InstitutionalTrackerProps) {
  // Mock data for demonstration
  const mockData = {
    etfFlows: {
      daily: 245.6,
      weekly: 1234.5,
      totalAUM: 45600,
      topETFs: [
        { name: "IBIT", flow: 156.2, aum: 15600 },
        { name: "FBTC", flow: 89.4, aum: 8900 },
        { name: "GBTC", flow: -45.2, aum: 12300 },
      ],
    },
    cmeData: {
      openInterest: 12.4,
      volume24h: 2.8,
      change24h: 5.6,
    },
    corporateHoldings: [
      { company: "MicroStrategy", holdings: 190000, value: 8.5, change: 2.3 },
      { company: "Tesla", holdings: 43200, value: 1.9, change: -0.8 },
      { company: "Block", holdings: 8027, value: 0.36, change: 1.2 },
    ],
  }

  const institutionalData = data || mockData

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* ETF Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSignIcon className="h-4 w-4" />
              Daily ETF Flows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">${institutionalData.etfFlows.daily}M</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUpIcon className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Positive inflow</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSignIcon className="h-4 w-4" />
              Weekly ETF Flows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">${institutionalData.etfFlows.weekly}M</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUpIcon className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">Strong demand</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BuildingIcon className="h-4 w-4" />
              Total ETF AUM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">${institutionalData.etfFlows.totalAUM}M</span>
              </div>
              <div className="text-xs text-muted-foreground">Across all Bitcoin ETFs</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ETF Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSignIcon className="h-5 w-5" />
            ETF Performance Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {institutionalData.etfFlows.topETFs.map((etf: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{etf.name}</div>
                  <Badge variant="outline" className="text-xs">
                    AUM: ${etf.aum}M
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-medium ${etf.flow > 0 ? "text-green-600" : "text-red-600"}`}>
                    {etf.flow > 0 ? "+" : ""}${etf.flow}M
                  </div>
                  {etf.flow > 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CME Futures */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BuildingIcon className="h-5 w-5" />
            CME Bitcoin Futures
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Open Interest</p>
              <p className="text-xl font-bold">${institutionalData.cmeData.openInterest}B</p>
              <div className="flex items-center gap-1">
                <TrendingUpIcon className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-600">+{institutionalData.cmeData.change24h}% (24h)</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">24h Volume</p>
              <p className="text-xl font-bold">${institutionalData.cmeData.volume24h}B</p>
              <p className="text-xs text-muted-foreground">Institutional activity</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Market Sentiment</p>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Bullish
              </Badge>
              <p className="text-xs text-muted-foreground">Based on positioning</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            {institutionalData.corporateHoldings.map((company: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="space-y-1">
                  <div className="font-semibold">{company.company}</div>
                  <div className="text-sm text-muted-foreground">
                    {company.holdings.toLocaleString()} BTC • ${company.value}B value
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`text-sm font-medium ${company.change > 0 ? "text-green-600" : "text-red-600"}`}>
                    {company.change > 0 ? "+" : ""}
                    {company.change}%
                  </div>
                  {company.change > 0 ? (
                    <TrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
