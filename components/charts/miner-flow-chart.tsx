"use client"

import { useState, useEffect } from "react"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Replace static data with state
const initialData = [
  { pool: "Antpool", hashrate: 18.5, blocks: 45 },
  { pool: "Foundry", hashrate: 16.2, blocks: 38 },
  { pool: "F2Pool", hashrate: 13.8, blocks: 32 },
  { pool: "Binance", hashrate: 11.4, blocks: 28 },
  { pool: "ViaBTC", hashrate: 9.7, blocks: 24 },
  { pool: "Poolin", hashrate: 8.3, blocks: 20 },
  { pool: "Others", hashrate: 22.1, blocks: 53 },
]

export function MinerFlowChart() {
  const [data, setData] = useState(initialData)

  // Add useEffect to fetch mining pool data
  useEffect(() => {
    const fetchMiningData = async () => {
      try {
        const response = await fetch("/api/mining-pools")
        const result = await response.json()

        if (result.pools) {
          setData(result.pools)
        }
      } catch (error) {
        console.error("Failed to fetch mining pool data:", error)
      }
    }

    fetchMiningData()
    const interval = setInterval(fetchMiningData, 300000) // Update every 5 minutes

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mining Pool Distribution</CardTitle>
        <CardDescription>Hash rate distribution and block production by mining pools</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            hashrate: {
              label: "Hash Rate (%)",
              color: "hsl(var(--chart-1))",
            },
            blocks: {
              label: "Blocks Mined",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pool" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar yAxisId="left" dataKey="hashrate" fill="var(--color-hashrate)" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="blocks" fill="var(--color-blocks)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
