"use client"

import { useState, useEffect, useCallback } from "react"
import { bitcoinPriceService } from "@/lib/bitcoin-price-service"

interface PriceData {
  price: number
  timestamp: number
  change24h?: number
  volume24h?: number
}

interface UseBitcoinPriceReturn {
  price: number | null
  change24h: number
  isConnected: boolean
  priceHistory: PriceData[]
  lastUpdate: Date | null
  trend: "up" | "down" | "neutral"
}

export function useBitcoinPrice(): UseBitcoinPriceReturn {
  const [price, setPrice] = useState<number | null>(null)
  const [change24h, setChange24h] = useState<number>(0)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [trend, setTrend] = useState<"up" | "down" | "neutral">("neutral")

  const updateTrend = useCallback((newPrice: number, oldPrice: number | null) => {
    if (oldPrice === null) {
      setTrend("neutral")
    } else if (newPrice > oldPrice) {
      setTrend("up")
    } else if (newPrice < oldPrice) {
      setTrend("down")
    } else {
      setTrend("neutral")
    }
  }, [])

  useEffect(() => {
    if (!bitcoinPriceService) return

    // Subscribe to price updates
    const unsubscribe = bitcoinPriceService.subscribe((priceData) => {
      const oldPrice = price
      setPrice(priceData.price)
      setChange24h(priceData.change24h || 0)
      setLastUpdate(new Date(priceData.timestamp))
      updateTrend(priceData.price, oldPrice)
    })

    // Update connection status
    const checkConnection = () => {
      if (bitcoinPriceService) {
        setIsConnected(bitcoinPriceService.getConnectionStatus())
      }
    }

    // Update price history
    const updateHistory = () => {
      if (bitcoinPriceService) {
        setPriceHistory(bitcoinPriceService.getPriceHistory(60)) // Last 60 minutes
      }
    }

    // Set up intervals
    const connectionInterval = setInterval(checkConnection, 1000)
    const historyInterval = setInterval(updateHistory, 5000) // Update every 5 seconds

    // Initial calls
    checkConnection()
    updateHistory()

    // Get current price if available
    if (bitcoinPriceService) {
      const currentPrice = bitcoinPriceService.getCurrentPrice()
      if (currentPrice) {
        setPrice(currentPrice.price)
        setChange24h(currentPrice.change24h || 0)
        setLastUpdate(new Date(currentPrice.timestamp))
      }
    }

    return () => {
      if (unsubscribe) unsubscribe()
      clearInterval(connectionInterval)
      clearInterval(historyInterval)
    }
  }, [price, updateTrend])

  return {
    price,
    change24h,
    isConnected,
    priceHistory,
    lastUpdate,
    trend,
  }
}
