"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, AlertTriangle, BarChart3 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type DarkPoolEvent = {
  id: string
  transaction_id: string
  amount: number
  confidence_score: number
  pattern_type: string
  exchanges_involved: string[]
  metadata: any
  detected_at: string
}

export default function DarkPoolDetectionPanel() {
  const [events, setEvents] = useState<DarkPoolEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/enterprise/dark-pool/events")
        const data = await response.json()

        if (data.success) {
          setEvents(data.events)
        }
      } catch (error) {
        console.error("Error fetching dark pool data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getPatternTypeBadge = (type: string) => {
    switch (type) {
      case "Large block transfer":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Large Block
          </Badge>
        )
      case "Cross-exchange arbitrage":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Arbitrage
          </Badge>
        )
      case "Institutional accumulation":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            Accumulation
          </Badge>
        )
      case "Dark pool liquidation":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            Liquidation
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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
        <h2 className="text-2xl font-bold">Dark Pool Detection</h2>
        <Button>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Configure Alerts
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Volume</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8,450 BTC</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Event Count</CardTitle>
            <CardDescription>Detected OTC activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Confidence</CardTitle>
            <CardDescription>Detection accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold">84%</div>
              <Progress value={84} className="h-2 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dark Pool Events</CardTitle>
          <CardDescription>OTC transaction monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Exchanges</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Detected</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length > 0 ? (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell>{getPatternTypeBadge(event.pattern_type)}</TableCell>
                    <TableCell className="font-medium">{event.amount.toLocaleString()} BTC</TableCell>
                    <TableCell>
                      {event.exchanges_involved.map((exchange, i) => (
                        <Badge key={i} variant="outline" className="mr-1">
                          {exchange}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={event.confidence_score * 100} className="h-2" />
                        <span className="text-xs">{Math.round(event.confidence_score * 100)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(event.detected_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    No dark pool events detected in the monitored time period.
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
