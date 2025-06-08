"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRightLeft, Clock, Settings } from "lucide-react"

type ArbitrageOpportunity = {
  id: string
  currency_pair: string
  buy_exchange: string
  sell_exchange: string
  buy_price: number
  sell_price: number
  spread_percentage: number
  estimated_profit: number
  volume_available: number
  expires_at: string
  created_at: string
}

export default function ArbitrageOpportunitiesPanel() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/enterprise/arbitrage/opportunities")
        const data = await response.json()

        if (data.success) {
          setOpportunities(data.opportunities)
        }
      } catch (error) {
        console.error("Error fetching arbitrage data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffMs = expires.getTime() - now.getTime()

    if (diffMs <= 0) {
      return "Expired"
    }

    const diffMins = Math.floor(diffMs / 60000)
    const diffSecs = Math.floor((diffMs % 60000) / 1000)

    return `${diffMins}m ${diffSecs}s`
  }

  const getSpreadBadge = (spread: number) => {
    if (spread >= 2) {
      return <Badge className="bg-green-500">High</Badge>
    } else if (spread >= 1) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Medium
        </Badge>
      )
    } else {
      return <Badge variant="outline">Low</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Arbitrage Opportunities</h2>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Opportunities</CardTitle>
            <CardDescription>Current arbitrage spreads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{opportunities.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Potential Profit</CardTitle>
            <CardDescription>Across all opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(opportunities.reduce((sum, opp) => sum + opp.estimated_profit, 0))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Spread</CardTitle>
            <CardDescription>Across active opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">
                {formatPercentage(
                  opportunities.reduce((sum, opp) => sum + opp.spread_percentage, 0) /
                    Math.max(1, opportunities.length),
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Opportunities</CardTitle>
          <CardDescription>Cross-exchange arbitrage spreads</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pair</TableHead>
                <TableHead>Buy</TableHead>
                <TableHead>Sell</TableHead>
                <TableHead>Spread</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.length > 0 ? (
                opportunities.map((opp) => (
                  <TableRow key={opp.id}>
                    <TableCell className="font-medium">{opp.currency_pair}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{opp.buy_exchange}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(opp.buy_price)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{opp.sell_exchange}</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(opp.sell_price)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSpreadBadge(opp.spread_percentage)}
                        <span>{formatPercentage(opp.spread_percentage)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">{formatCurrency(opp.estimated_profit)}</TableCell>
                    <TableCell>{opp.volume_available.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">{getTimeRemaining(opp.expires_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm">
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No arbitrage opportunities found. Markets are currently efficient.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
