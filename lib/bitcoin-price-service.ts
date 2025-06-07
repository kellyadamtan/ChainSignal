interface PriceData {
  price: number
  timestamp: number
  change24h?: number
  volume24h?: number
}

interface PriceSubscriber {
  id: string
  callback: (data: PriceData) => void
}

class BitcoinPriceService {
  private subscribers: PriceSubscriber[] = []
  private currentPrice: PriceData | null = null
  private priceHistory: PriceData[] = []
  private isConnected = false
  private pollingInterval: NodeJS.Timeout | null = null
  private pollingDelay = 5000 // 5 seconds
  private lastFetchTime = 0
  private retryCount = 0
  private maxRetries = 3

  constructor() {
    // Start polling when service is instantiated
    if (typeof window !== "undefined") {
      this.startPolling()
    }
  }

  private async fetchPrice() {
    try {
      // Prevent multiple simultaneous requests
      if (Date.now() - this.lastFetchTime < 2000) {
        return
      }

      this.lastFetchTime = Date.now()

      // Use our own API endpoint that connects to Crypto APIs
      const response = await fetch("/api/bitcoin-price/current")

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.price) {
        const priceData: PriceData = {
          price: data.price,
          timestamp: data.timestamp || Date.now(),
          change24h: data.change24h || 0,
          volume24h: data.volume24h || 0,
        }

        this.currentPrice = priceData
        this.addToHistory(priceData)
        this.notifySubscribers(priceData)
        this.recordPrice(priceData)
        this.isConnected = true
        this.retryCount = 0 // Reset retry count on success
      }
    } catch (error) {
      console.error("Error fetching Bitcoin price from Crypto APIs:", error)
      this.isConnected = false

      // Implement exponential backoff for retries
      this.retryCount++
      if (this.retryCount <= this.maxRetries) {
        const backoffDelay = Math.min(this.pollingDelay * Math.pow(2, this.retryCount - 1), 30000)
        console.log(`Retrying in ${backoffDelay / 1000} seconds (attempt ${this.retryCount}/${this.maxRetries})`)
        setTimeout(() => this.fetchPrice(), backoffDelay)
      }
    }
  }

  private startPolling() {
    // Clear any existing interval
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
    }

    // Fetch immediately
    this.fetchPrice()

    // Then set up interval
    this.pollingInterval = setInterval(() => {
      this.fetchPrice()
    }, this.pollingDelay)
  }

  private addToHistory(priceData: PriceData) {
    this.priceHistory.push(priceData)

    // Keep only last 24 hours of data
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.priceHistory = this.priceHistory.filter((p) => p.timestamp >= oneDayAgo)
  }

  private notifySubscribers(priceData: PriceData) {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber.callback(priceData)
      } catch (error) {
        console.error("Error notifying subscriber:", error)
      }
    })
  }

  private async recordPrice(priceData: PriceData) {
    try {
      await fetch("/api/bitcoin-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(priceData),
      })
    } catch (error) {
      // Silently fail - don't interrupt price updates
      console.warn("Failed to record price:", error)
    }
  }

  public subscribe(callback: (data: PriceData) => void): () => void {
    const id = Math.random().toString(36).substring(7)
    this.subscribers.push({ id, callback })

    // Send current price immediately if available
    if (this.currentPrice) {
      callback(this.currentPrice)
    }

    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub.id !== id)
    }
  }

  public getCurrentPrice(): PriceData | null {
    return this.currentPrice
  }

  public getPriceHistory(minutes = 60): PriceData[] {
    const cutoff = Date.now() - minutes * 60 * 1000
    return this.priceHistory.filter((p) => p.timestamp >= cutoff)
  }

  public getConnectionStatus(): boolean {
    return this.isConnected
  }

  public disconnect() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
    this.isConnected = false
    this.subscribers = []
  }
}

// Singleton instance
export const bitcoinPriceService = typeof window !== "undefined" ? new BitcoinPriceService() : null

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    if (bitcoinPriceService) {
      bitcoinPriceService.disconnect()
    }
  })
}
