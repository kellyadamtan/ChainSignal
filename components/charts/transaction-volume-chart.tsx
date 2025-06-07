"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function TransactionVolumeChart() {
  // Replace the static data with state
  const [data, setData] = useState([
    { time: "00:00", volume: 2400, value: 1200000 },
    { time: "04:00", volume: 1398, value: 980000 },
    { time: "08:00", volume: 9800, value: 2100000 },
    { time: "12:00", volume: 3908, value: 1800000 },
    { time: "16:00", volume: 4800, value: 2400000 },
    { time: "20:00", volume: 3800, value: 1900000 },
    { time: "24:00", volume: 4300, value: 2200000 },
  ])

  // Add useEffect to fetch real data
  useEffect(() => {
    const fetchVolumeData = async () => {
      try {
        const response = await fetch("/api/metrics")
        const result = await response.json()

        if (result.volumeData && result.volumeData.length > 0) {
          setData(result.volumeData)
        }
      } catch (error) {
        console.error("Failed to fetch volume data:", error)
      }
    }

    fetchVolumeData()
    const interval = setInterval(fetchVolumeData, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Volume</CardTitle>
        <CardDescription>Real-time Bitcoin transaction volume and value over 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            volume: {
              label: "Transaction Count",
              color: "hsl(var(--chart-1))",
            },
            value: {
              label: "Total Value (USD)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="volume"
                stroke="var(--color-volume)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="value"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
