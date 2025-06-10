"use client"

import { useEffect, useRef, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from "chart.js"
import "chartjs-adapter-date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, TimeScale)

interface AdvancedChartProps {
  data: any
  timeframe: string
  overlays: {
    showNews: boolean
    showWhaleTransactions: boolean
    showLiquidityHeatmap: boolean
    showPatternRecognition: boolean
  }
  loading: boolean
}

export default function AdvancedChart({ data, timeframe, overlays, loading }: AdvancedChartProps) {
  const chartRef = useRef<any>(null)
  const [chartData, setChartData] = useState<any>(null)
  const [annotations, setAnnotations] = useState<any[]>([])

  useEffect(() => {
    if (!data?.historicalData?.prices) return

    const prices = data.historicalData.prices.map((price: [number, number]) => ({
      x: new Date(price[0]),
      y: price[1],
    }))

    // Generate whale transaction markers
    const whaleTransactions = overlays.showWhaleTransactions ? generateWhaleTransactions(prices) : []

    // Generate news event markers
    const newsEvents = overlays.showNews ? generateNewsEvents(prices) : []

    // Generate AI pattern recognition
    const aiPatterns = overlays.showPatternRecognition ? generateAIPatterns(prices) : []

    const datasets = [
      {
        label: "Bitcoin Price",
        data: prices,
        borderColor: "rgb(249, 115, 22)",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.4,
        pointRadius: 0,
        fill: true,
      },
    ]

    // Add liquidity heatmap as background
    if (overlays.showLiquidityHeatmap) {
      datasets.push({
        label: "Support Zones",
        data: generateLiquidityZones(prices),
        borderColor: "rgba(34, 197, 94, 0.3)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0,
        pointRadius: 0,
        fill: false,
      } as any)
    }

    setChartData({ datasets })
    setAnnotations([...whaleTransactions, ...newsEvents, ...aiPatterns])
  }, [data, overlays])

  const generateWhaleTransactions = (prices: any[]) => {
    const transactions = []
    for (let i = 0; i < prices.length; i += Math.floor(prices.length / 10)) {
      if (Math.random() > 0.7) {
        // 30% chance of whale transaction
        transactions.push({
          type: "point",
          xValue: prices[i].x,
          yValue: prices[i].y,
          backgroundColor: "rgba(147, 51, 234, 0.8)",
          borderColor: "rgb(147, 51, 234)",
          borderWidth: 2,
          radius: 8,
          label: {
            content: "🐋 Large Transfer",
            enabled: true,
            position: "top",
          },
        })
      }
    }
    return transactions
  }

  const generateNewsEvents = (prices: any[]) => {
    const events = []
    const newsItems = [
      { text: "📰 ETF Approval", sentiment: 1 },
      { text: "📰 Regulatory Update", sentiment: -1 },
      { text: "📰 Institutional Adoption", sentiment: 1 },
      { text: "📰 Market Analysis", sentiment: 0 },
    ]

    for (let i = 0; i < prices.length; i += Math.floor(prices.length / 8)) {
      if (Math.random() > 0.6) {
        // 40% chance of news event
        const news = newsItems[Math.floor(Math.random() * newsItems.length)]
        events.push({
          type: "line",
          xMin: prices[i].x,
          xMax: prices[i].x,
          borderColor:
            news.sentiment > 0 ? "rgb(34, 197, 94)" : news.sentiment < 0 ? "rgb(239, 68, 68)" : "rgb(156, 163, 175)",
          borderWidth: 2,
          label: {
            content: news.text,
            enabled: true,
            position: "start",
          },
        })
      }
    }
    return events
  }

  const generateAIPatterns = (prices: any[]) => {
    const patterns = []
    const patternTypes = [
      { name: "🔺 Bull Flag", color: "rgb(34, 197, 94)" },
      { name: "🔻 Bear Flag", color: "rgb(239, 68, 68)" },
      { name: "📐 Triangle", color: "rgb(59, 130, 246)" },
      { name: "🎯 Support", color: "rgb(168, 85, 247)" },
    ]

    for (let i = 0; i < prices.length; i += Math.floor(prices.length / 6)) {
      if (Math.random() > 0.8) {
        // 20% chance of AI pattern
        const pattern = patternTypes[Math.floor(Math.random() * patternTypes.length)]
        patterns.push({
          type: "box",
          xMin: prices[i].x,
          xMax: prices[Math.min(i + 20, prices.length - 1)].x,
          yMin: prices[i].y * 0.98,
          yMax: prices[i].y * 1.02,
          backgroundColor: pattern.color + "20",
          borderColor: pattern.color,
          borderWidth: 1,
          label: {
            content: pattern.name,
            enabled: true,
            position: "center",
          },
        })
      }
    }
    return patterns
  }

  const generateLiquidityZones = (prices: any[]) => {
    return prices.map((price, index) => ({
      x: price.x,
      y: price.y * (0.95 + Math.random() * 0.1), // Simulate support/resistance zones
    }))
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const price = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(context.parsed.y)
            return `Price: ${price}`
          },
          title: (context: any) => {
            const date = new Date(context[0].parsed.x)
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          },
        },
      },
      annotation: {
        annotations: annotations,
      },
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: timeframe === "1" ? "hour" : "day",
        },
        grid: { display: false },
      },
      y: {
        position: "right" as const,
        ticks: {
          callback: (value: any) => {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              notation: "compact",
            }).format(value)
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  }

  if (loading) {
    return <Skeleton className="h-80 w-full" />
  }

  if (!chartData) {
    return <div className="h-80 flex items-center justify-center text-muted-foreground">No chart data available</div>
  }

  return (
    <div className="space-y-4">
      {/* Active Overlays */}
      <div className="flex flex-wrap gap-2">
        {overlays.showNews && <Badge variant="secondary">📰 News Events</Badge>}
        {overlays.showWhaleTransactions && <Badge variant="secondary">🐋 Whale Moves</Badge>}
        {overlays.showLiquidityHeatmap && <Badge variant="secondary">💧 Liquidity Zones</Badge>}
        {overlays.showPatternRecognition && <Badge variant="secondary">🤖 AI Patterns</Badge>}
      </div>

      {/* Chart */}
      <div className="h-80">
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>

      {/* Chart Legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span>Whale Transactions (>1000 BTC)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Bullish News Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Bearish News Events</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>AI Pattern Recognition</span>
        </div>
      </div>
    </div>
  )
}
