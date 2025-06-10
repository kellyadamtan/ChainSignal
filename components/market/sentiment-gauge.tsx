"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface SentimentGaugeProps {
  value: number
  loading?: boolean
  showDetails?: boolean
}

export default function SentimentGauge({ value, loading, showDetails }: SentimentGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setDisplayValue(value), 100)
      return () => clearTimeout(timer)
    }
  }, [value, loading])

  const getSentimentLabel = (val: number) => {
    if (val <= 20) return { label: "Extreme Fear", color: "bg-red-500" }
    if (val <= 40) return { label: "Fear", color: "bg-orange-500" }
    if (val <= 60) return { label: "Neutral", color: "bg-yellow-500" }
    if (val <= 80) return { label: "Greed", color: "bg-green-500" }
    return { label: "Extreme Greed", color: "bg-green-600" }
  }

  if (loading) {
    return <Skeleton className="h-32 w-full" />
  }

  const sentiment = getSentimentLabel(displayValue)

  return (
    <div className="space-y-4">
      {/* Circular Gauge */}
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(displayValue / 100) * 314} 314`}
            className={sentiment.color.replace("bg-", "text-")}
            style={{
              transition: "stroke-dasharray 1s ease-in-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{displayValue}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>

      {/* Sentiment Label */}
      <div className="text-center">
        <Badge variant="secondary" className={`${sentiment.color} text-white`}>
          {sentiment.label}
        </Badge>
      </div>

      {/* Details */}
      {showDetails && (
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Volatility:</span>
            <span className="font-medium">{displayValue > 70 ? "High" : displayValue > 30 ? "Medium" : "Low"}</span>
          </div>
          <div className="flex justify-between">
            <span>Market Momentum:</span>
            <span className="font-medium">
              {displayValue > 60 ? "Bullish" : displayValue > 40 ? "Neutral" : "Bearish"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Social Sentiment:</span>
            <span className="font-medium">
              {displayValue > 65 ? "Positive" : displayValue > 35 ? "Mixed" : "Negative"}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
