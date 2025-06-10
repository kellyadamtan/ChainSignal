"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface SentimentGaugeProps {
  value: number
  loading: boolean
  showDetails?: boolean
}

export default function SentimentGauge({ value, loading, showDetails = false }: SentimentGaugeProps) {
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setAnimatedValue(value), 100)
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

  const sentiment = getSentimentLabel(animatedValue)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse bg-gray-200 rounded-full h-32 w-32 mx-auto"></div>
        <div className="animate-pulse bg-gray-200 rounded h-4 w-24 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Circular Gauge */}
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgb(229, 231, 235)" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={`rgb(${value <= 20 ? "239, 68, 68" : value <= 40 ? "249, 115, 22" : value <= 60 ? "234, 179, 8" : value <= 80 ? "34, 197, 94" : "22, 163, 74"})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(animatedValue / 100) * 314} 314`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(animatedValue)}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>

      {/* Sentiment Label */}
      <div className="text-center">
        <Badge className={`${sentiment.color} text-white`}>{sentiment.label}</Badge>
      </div>

      {/* Progress Bar */}
      <Progress value={animatedValue} className="w-full" />

      {showDetails && (
        <div className="space-y-3 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Volatility</p>
              <p className="font-semibold">{value > 70 ? "High" : value > 40 ? "Medium" : "Low"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Trend</p>
              <p className="font-semibold">{value > 60 ? "Bullish" : value < 40 ? "Bearish" : "Neutral"}</p>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              Fear & Greed Index combines market volatility, volume, social media sentiment, surveys, Bitcoin dominance,
              and Google trends.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
